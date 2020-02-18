import { Log, Subscription, Task, TaskType } from "@/main/database/entity";
import { LogType } from "@/main/database/entity/Log";
import { AriaConfig } from "@/main/database/service/config";
import { TasksStatus } from "@/shared/interface";
import logger from "@/shared/logger";
import { sleep } from "@/shared/utils";
import Bluebird from "bluebird";
import ipc from "electron-promise-ipc";
import { exists } from "fs";
import { Gallery, Result, Scraps, Submission } from "furaffinity-api";
import { Submission as ISubmission } from "furaffinity-api/dist/interfaces";
import { promisify } from "util";

import { mainWindow } from ".";
import { db } from ".";
import { Download } from "./Download";

const existsAsync = promisify(exists);

// 优化重点，减少使用次数
function send(route: string, ...args: any) {
  if (mainWindow.win) {
    return ipc.send(route, mainWindow.win.webContents, ...args);
  }
}

class UpdateOnlyError extends Error {}
class FetchStopError extends Error {}

/**
 * 获取订阅内的作品类
 */
export class Fetch {
  private download = new Download();

  private fetching: boolean = false;
  private maxRetry: number = 5;
  private concurrency: number = 12;

  private sub: Subscription | null = null;

  private idTask: { [propName: string]: Task } = {};
  private statusTask: { [propName: string]: number } = {};

  get currentSub() {
    return this.sub;
  }

  get tasksStatus(): TasksStatus {
    return {
      gallery: this.statusTask[TaskType.Gallery] ?? 0,
      galleryComplete: this.statusTask[`${TaskType.Gallery}-complete`] ?? 0,
      galleryActive: this.statusTask[`${TaskType.Gallery}-active`] ?? 0,
      scraps: this.statusTask[TaskType.Scraps] ?? 0,
      scrapsComplete: this.statusTask[`${TaskType.Scraps}-complete`] ?? 0,
      scrapsActive: this.statusTask[`${TaskType.Scraps}-active`] ?? 0
    };
  }

  get globalStat() {
    return this.download.globalStat;
  }

  init(config: AriaConfig) {
    this.download.init(config);
    this.download.on("task.add", (task: Task) => this.onTaskUpdate(task));
    this.download.on("task.update", (task: Task) => this.onTaskUpdate(task));
  }

  onTaskUpdate(task: Task) {
    this.refreshStatusTak();
    send("task.update");
  }

  /**
   * 开始
   */
  async start(subs: Subscription[]) {
    if (this.fetching || subs.length === 0) {
      return;
    }

    // 开始获取
    this.beforeFetchAll();

    try {
      await this.mapSubs(subs);
    } catch (e) {
      logger.error(e);
    }

    // 结束获取
    this.afterFetchAll();
  }

  /**
   * 停止
   */
  async stop() {
    this.fetching = false;
    await this.download.stop();
  }

  /**
   * 遍历订阅下载列表
   * @param subs 订阅列表
   */
  private async mapSubs(subs: Subscription[]) {
    // 获取当前订阅
    for (const sub of subs) {
      await this.beforeFetchOne(sub);

      // 下载的图集
      const types: any = { [TaskType.Gallery]: sub.gallery, [TaskType.Scraps]: sub.scraps };
      for (const type in types) {
        if (!types[type]) {
          continue;
        }

        try {
          // 下载此图集的所有图片
          this.addLog(`[${type}] 开始获取`);
          await this.mapPages(type as TaskType, sub);
        } catch (e) {
          if (e instanceof UpdateOnlyError) {
            // 仅更新模式跳出循环
            this.addLog(`[${type}] ${e.message}`);
          } else if (e instanceof FetchStopError) {
            // 用户手动停止
            this.addLog(`[${type}] 终止获取`);
            break;
          } else {
            this.addLog(`[${type}] 出现错误，停止获取：${e.message}`, LogType.Error);
            logger.error(e);
          }
        }
      }

      await this.afterFetchOne(sub);
    }
  }

  /**
   * 遍历所有页
   * @param type 类型
   * @param param1 附加参数
   */
  private async mapPages(type: TaskType, sub: Subscription) {
    for (let page = 1; ; page++) {
      if (!this.fetching) {
        throw new FetchStopError();
      }

      const results: Result[] | null = await this.getResults(sub, page, type);
      if (results === null) {
        throw new Error("获取作品列表失败");
      }

      if (results.length === 0) {
        this.addLog(`[${type}] 获取结束`);
        logger.log("页数到头了", sub.id, type, page);
        break;
      }

      try {
        await this.mapSubmissions(results, sub, type, page);

        // 更新订阅
        sub.galleryTaskNum = this.tasksStatus.gallery;
        sub.scrapsTaskNum = this.tasksStatus.scraps;
        send("sub.update", sub);
      } catch (e) {
        if (e instanceof FetchStopError) {
          throw e;
        } else {
          this.addLog(e.message, LogType.Error);
          logger.error(e);
        }
      }
    }
  }

  /**
   * 并行遍历作品列表
   * @param submissions 作品列表
   * @param param 附加参数
   */
  private async mapSubmissions(
    submissions: Result[],
    sub: Subscription,
    type: TaskType,
    page: number
  ) {
    for (let begin = 0; begin < submissions.length; begin += this.concurrency) {
      if (!this.fetching) {
        throw new FetchStopError();
      }

      let delay = 0;
      const items = submissions.slice(begin, begin + this.concurrency);
      await Bluebird.map(items, async (item, index) => {
        // 先判断缓存中有没有
        const task = this.idTask[item.id];
        if (task && task.status === "complete" && task.path && (await existsAsync(task.path))) {
          logger.log("跳过作品", sub.id, type, page, begin + index + 1);
          return;
        }

        // 间隔100毫秒发动
        await sleep(100 * delay++);

        // 创建新任务
        let newTask: Task;
        if (task) {
          // 从现有任务创建
          newTask = this.createTaskFromExists(task, sub, type);
        } else {
          // 从网络获取并创建
          const submission = await this.getSubmission(item);
          if (submission === null) {
            throw new Error(`作品详情获取失败：${sub.id},${type}, ${page}, ${index}`);
          }
          newTask = this.createTaskFromSubmission(submission, sub, type);
        }
        await this.download.add(newTask);
        this.addTaskHash(newTask);
      });
    }
  }

  /**
   * 获取所有订阅前执行
   */
  beforeFetchAll() {
    this.fetching = true;
  }

  /**
   * 获取所有订阅后执行
   */
  afterFetchAll() {
    this.fetching = false;
  }

  /**
   * 获取某一订阅前执行
   * @param sub 当前订阅
   */
  async beforeFetchOne(sub: Subscription) {
    this.sub = sub;
    await this.getTasks(sub);

    sub.status = "active";
    // this.clearLogs(sub.id);
    await send("sub.update", sub);
  }

  /**
   * 获取某一订阅后执行
   * @param sub 当前订阅
   */
  async afterFetchOne(sub: Subscription) {
    // 等待下载结束
    await this.download.waitForComplete();

    // 清理记录
    this.download.clean();

    sub.status = "";
    sub.galleryTaskNum = this.tasksStatus.gallery;
    sub.scrapsTaskNum = this.tasksStatus.scraps;

    // 保存订阅信息
    await db.saveSub(sub);
    await db.saveTasks(Object.values(this.idTask));

    send("sub.update", sub);
    send("task.update");

    this.sub = null;
    this.clearTaskHash();
  }

  /**
   * 从已有的任务中创建任务
   * @param task 任务
   * @param sub 任务所属订阅
   * @param type 类型
   */
  createTaskFromExists(task: Task, sub: Subscription, type: TaskType) {
    task.gid = "";
    task.path = "";
    task.type = type;
    task.status = "";
    task.sub = sub;
    return task;
  }

  /**
   * 从作品详情中创建任务
   * @param task 任务
   * @param sub 任务所属订阅
   * @param type 类型
   */
  createTaskFromSubmission(submission: ISubmission, sub: Subscription, type: TaskType) {
    // 创建新任务
    const task = new Task();
    task.gid = "";
    task.id = submission.id;
    task.downloadUrl = submission.downloadUrl;
    task.url = submission.url;
    task.sub = sub;
    task.type = type;
    return task;
  }

  /**
   * 获取作品列表
   * @param sub 订阅
   * @param page 页数
   * @param type 类型
   */
  async getResults(sub: Subscription, page: number, type: TaskType): Promise<Result[] | null> {
    const fun = () =>
      type === TaskType.Gallery
        ? Bluebird.resolve(Gallery(sub.id, page))
        : Bluebird.resolve(Scraps(sub.id, page));

    return await this.retry(fun);
  }

  /**
   * 获取作品详情
   * @param submission 作品信息
   */
  async getSubmission(submission: Result): Promise<ISubmission | null> {
    // 获取这个作品的详细信息
    const fun = () => Bluebird.resolve(Submission(submission.id));
    return await this.retry(fun);
  }

  /**
   * 反复重试并返回结果
   * @param fun 要执行的函数
   * @param error 错误时执行的函数
   * @param count 重试次数
   */
  private async retry(fun: Function, count: number = this.maxRetry): Promise<any> {
    if (count-- <= 0) {
      return null;
    }
    const result = await fun();
    if (result === null) {
      await sleep(1000);
      return this.retry(fun, count);
    }
    return result;
  }

  /**
   * 添加任务日志
   * @param message 日志信息
   * @param param 参数
   */
  private async addLog(message: string, type: LogType = LogType.Log) {
    // TODO: i18n
    const log = new Log();
    log.type = type;
    log.message = message;
    log.createAt = new Date().getTime();

    // @ts-ignore
    logger[type](message);
    // TODO: 存数据库
  }

  /**
   * 清空某订阅的日志
   * @param id 订阅id
   */
  private clearLogs(id: string) {
    db.clearLogs(id);
    send("log.clear", id);
  }

  /**
   * 获取此订阅的所有任务并缓存
   * @param sub 订阅
   */
  private async getTasks(sub: Subscription) {
    this.clearTaskHash();
    const tasks = await db.getTasks(sub.id);
    for (const task of tasks) {
      task.sub = sub;
      this.addTaskHash(task);
    }
    this.refreshStatusTak();
  }

  /**
   * 清空任务缓存
   */
  private clearTaskHash() {
    this.idTask = {};
    this.statusTask = {};
  }

  /**
   * 缓存任务
   * @param task 任务
   * @param sub 订阅
   */
  private addTaskHash(task: Task) {
    if (task.id) {
      this.idTask[task.id] = task;
    }
  }

  /**
   * 刷新状态
   */
  private refreshStatusTak() {
    this.statusTask = {};
    for (const task of Object.values(this.idTask)) {
      this.statusTask[task.type] = this.statusTask[task.type] ?? 0;
      this.statusTask[task.type]++;

      const status = `${task.type}-${task.status}`;
      this.statusTask[status] = this.statusTask[status] ?? 0;
      this.statusTask[status]++;
    }
  }
}
