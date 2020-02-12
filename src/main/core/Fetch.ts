import logger from "@/shared/logger";
import { sleep } from "@/shared/utils";
import Bluebird from "bluebird";
import ipc from "electron-promise-ipc";
import fs from "fs";
import { promisify } from "util";
import { Gallery, Result, Scraps, Submission } from "furaffinity-api";
import { Submission as ISubmission } from "furaffinity-api/dist/interfaces";
import { Log, Subscription, Task, TaskType } from "../database/entity";
import { db } from "./";
import { mainWindow, ariaController } from "./index";
import _ from "lodash";
import * as aria from "@/shared/aria";
import { AriaConfig } from "../database/service/config";
import { AriaStatus } from "@/shared/interface";

const existsAsync = promisify(fs.exists);

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
  private fetching: boolean = false;
  private maxRetry: number = 3;

  private updateSubList: Subscription[] = [];
  private addTaskList: Task[] = [];
  private updateTaskList: Task[] = [];
  private addLogList: Log[] = [];

  private updateSubThrottle: Function = _.throttle(this.doUpdateSubs, 1000);
  private updateTaskThrottle: Function = _.throttle(this.doUpdateTasks, 1000);
  private addLogThrottle: Function = _.throttle(this.doUpdateLogs, 1000);

  taskHash: { [propName: string]: Task } = {};

  ariaStatus: AriaStatus = {
    downloadSpeed: "0",
    numActive: "0",
    numStopped: "0",
    numStoppedTotal: "0",
    numWaiting: "0",
    uploadSpeed: "0"
  };

  ariaStatusUpdater: any = null;

  get downloading() {
    return !!(
      Number.parseInt(this.ariaStatus.numActive) +
      Number.parseInt(this.ariaStatus.numWaiting)
    );
  }

  async init(config: AriaConfig) {
    await aria.initClient(config);

    aria.onDownloadStart((event: any) => this.handleDownloadStart(event));
    aria.onDownloadStop((event: any) => this.handleDownloadStop(event));
    aria.onDownloadComplete((event: any) => this.handleDownloadComplete(event));
    aria.onDownloadError((event: any) => this.handleDownloadError(event));
    aria.onDownloadPause((event: any) => this.handleDownloadPause(event));

    this.ariaStatusUpdater = setInterval(async () => {
      try {
        this.ariaStatus = await aria.getGlobalStat();
      } catch (e) {
        logger.error(e);
        clearInterval(this.ariaStatusUpdater);
        // 如果主窗口没有关闭的时候aria崩溃的话
        // 就重新打开aria
        if (mainWindow.win) {
          await ariaController.start();
          this.init(config);
          // 继续未完成的任务
          this.addTasksToAria();
        }
      }
    }, 500);
  }

  async handleDownloadStart(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "active");
    logger.log("任务开始", gid);
  }

  async handleDownloadComplete(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "complete");
    logger.log("任务完成", gid);
  }

  async handleDownloadPause(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "paused");
    logger.log("任务暂停", gid);
  }

  async handleDownloadStop(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "stopped");
    logger.log("任务停止", gid);
  }

  async handleDownloadError(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "error");
    logger.log("任务失败", gid);
  }

  /**
   * 更新任务信息
   * @param gid 任务gid
   * @param status 任务状态
   */
  async refreshTask(gid: string, status: string) {
    // 获取任务信息
    const task = this.taskHash[gid];
    if (task) {
      // 覆盖任务状态
      task.status = status;
      // 覆盖文件位置
      // 任务完成后可以或得到文件位置
      if (status === "complete") {
        const item = await aria.fetchTaskItem({ gid });
        task.path = item.files[0].path;
        logger.log("文件下载到", item.files[0].path);
      }
      // 任务结束后删除引用
      if (status !== "active") {
        delete this.taskHash[gid];
      }
      // 保存到数据库
      this.updateTaskList.push(task);
      this.updateTaskThrottle();
    }
  }

  /**
   * 批量更新任务
   */
  private doUpdateSubs() {
    db.saveSubs(this.updateSubList);
    send("sub.update", this.updateSubList);
    this.updateSubList = [];
  }

  /**
   * 批量更新任务
   */
  private async doUpdateTasks() {
    db.saveTasks(this.updateTaskList);
    this.updateTaskList = [];
    send("task.update");
  }

  /**
   * 批量更新日志
   */
  private doUpdateLogs() {
    db.addLogs(this.addLogList);
    send("log.add", this.addLogList);
    this.addLogList = [];
  }

  /**
   * 将任务添加进aria
   * @param task 任务
   */
  private async addTasksToAria() {
    try {
      // 保存gid
      for (const task of this.addTaskList) {
        task.gid = await aria.addUri({
          uris: [task.downloadUrl],
          options: {
            dir:
              task.type === "gallery"
                ? task.sub?.galleryDir ?? ""
                : task.sub?.scrapsDir ?? ""
          }
        });
        // 添加缓存
        this.taskHash[task.gid] = task;
      }
      this.addTaskList = [];
    } catch (e) {
      logger.error("Add tasks to aria error", e);
    }
  }

  /**
   * 添加任务日志
   * @param sub 订阅
   * @param param1 参数
   */
  private async addLog(sub: Subscription, { type = "info", message = "" }) {
    const log = new Log();
    log.type = type;
    log.message = message;
    log.createAt = new Date().getTime();
    log.sub = sub;

    this.addLogList.push(log);
    this.addLogThrottle();
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
   * 反复重试并返回结果
   * @param fun 要执行的函数
   * @param error 错误时执行的函数
   * @param times 重试次数
   */
  private async retry(
    fun: Function,
    error: Function,
    times: number = this.maxRetry
  ): Promise<any> {
    if (times-- <= 0) {
      return null;
    }
    const result = await fun();
    if (result === null) {
      error();
      await sleep(1000);
      return this.retry(fun, error, times);
    }
    return result;
  }

  /**
   * 开始
   */
  async start(subs: Subscription[]) {
    if (this.fetching) {
      return;
    }

    if (subs.length === 0) {
      return;
    }

    // 开始获取
    this.fetching = true;

    try {
      await this.mapSubs(subs);
    } catch (e) {
      logger.error(e);
    }

    // 结束获取
    this.fetching = false;
  }

  /**
   * 停止
   */
  async stop() {
    this.fetching = false;
    await aria.removeAllTask();
  }

  /**
   * 获取aria全局状态
   */
  getGlobalStat() {
    return this.ariaStatus;
  }

  /**
   * 等待下载完成
   */
  async waitForComplete() {
    return new Bluebird((resolve, reject) => {
      const fun = () => {
        if (!this.downloading || !this.fetching) {
          resolve();
        } else {
          setTimeout(fun, 100);
        }
      };
      fun();
    });
  }

  /**
   * 遍历订阅下载列表
   * @param subs 订阅列表
   */
  private async mapSubs(subs: Subscription[]) {
    // 获取当前订阅
    for (const sub of subs) {
      sub.status = "active";
      this.updateSubList.push(sub);
      this.updateSubThrottle();
      this.clearLogs(sub.id);

      // 下载的图集
      const types: any = { gallery: sub.gallery, scraps: sub.scraps };
      for (const type in types) {
        if (!types[type]) {
          continue;
        }

        try {
          // 下载此图集的所有图片
          this.addLog(sub, { message: `[${type}] 开始获取` });
          await this.mapPages(type, { sub });
          // // 正常获取完所有的作品后就开启仅更新模式
          // if (type === "gallery") {
          //   sub.galleryUpdateOnly = true;
          // } else {
          //   sub.scrapsUpdateOnly = true;
          // }
        } catch (e) {
          if (e instanceof UpdateOnlyError) {
            // 仅更新模式跳出循环
            this.addLog(sub, {
              message: `[${type}] ${e.message}`
            });
          } else if (e instanceof FetchStopError) {
            // 用户手动停止
            this.addLog(sub, {
              message: `[${type}] 终止获取`
            });
            break;
          } else {
            this.addLog(sub, {
              type: "error",
              message: `[${type}] 出现错误，停止获取：${e.message}`
            });
            logger.error(e);
          }
        }
      }

      // 等待下载结束
      await this.waitForComplete();

      // 清理记录
      aria.purgeTaskRecord();

      sub.status = "";
      this.updateSubList.push(sub);
      this.updateSubThrottle();
    }
  }

  /**
   * 遍历所有页
   * @param type 类型
   * @param param1 附加参数
   */
  private async mapPages(type: string, { sub }: { sub: Subscription }) {
    for (let page = 1; ; page++) {
      if (!this.fetching) {
        throw new FetchStopError();
      }

      const fun = () =>
        type === "gallery"
          ? Bluebird.resolve(Gallery(sub.id, page))
          : Bluebird.resolve(Scraps(sub.id, page));

      const error = () => {
        this.addLog(sub, {
          type: "error",
          message: `[${type}/${page}] 获取失败，1秒后重试`
        });
      };
      const result: Result[] | null = await this.retry(fun, error);
      if (result === null) {
        throw new Error("获取作品列表失败");
      }

      if (result.length === 0) {
        this.addLog(sub, { message: `[${type}] 获取结束` });
        logger.log("页数到头了", sub.id, type, page);
        break;
      }

      await this.mapSubmissions(result, { sub, type, page });
    }
  }

  /**
   * 遍历作品列表
   * @param submissions 作品列表
   * @param param1 附加参数
   */
  private async mapSubmissions(
    submissions: Result[],
    { sub, type, page }: { sub: Subscription; type: string; page: number }
  ) {
    for (let index = 0; index < submissions.length; index++) {
      if (!this.fetching) {
        throw new FetchStopError();
      }

      // 获取当前作品
      const submission = submissions[index];

      // 先判断数据库中有没有
      const task = await db.getTask(submission.id);
      if (
        task &&
        task.status === "complete" &&
        task.path &&
        (await existsAsync(task.path))
      ) {
        logger.log("跳过作品", sub.id, type, page, index + 1);
        // const updateOnly =
        //   type === "gallery" ? sub.galleryUpdateOnly : sub.scrapsUpdateOnly;
        // if (updateOnly) {
        //   throw new UpdateOnlyError("仅更新模式下快速跳过");
        // }
        continue;
      }

      if (task) {
        task.gid = "";
        task.path = "";
        task.type = type;
        task.status = "";
        task.sub = sub;

        await this.saveTask(task, { sub, type, page, index });
        continue;
      }

      // 获取这个作品的详细信息
      const fun = () => Bluebird.resolve(Submission(submission.id));
      const error = () => {
        this.addLog(sub, {
          type: "error",
          message: `[${type}/${page}/${index + 1}] 获取失败，1秒后重试`
        });
      };

      const detail: ISubmission | null = await this.retry(fun, error);
      if (detail === null) {
        throw new Error("作品详情获取失败");
      }

      if (!this.fetching) {
        throw new FetchStopError();
      }

      // 创建新任务并保存
      const t = new Task();
      t.gid = "";
      t.id = detail.id;
      t.downloadUrl = detail.downloadUrl;
      t.url = detail.url;
      t.sub = sub;
      t.type = type;

      await this.saveTask(t, { sub, type, page, index });

      // 更新数量
      sub.galleryTaskNum = await db.getTaskNum(sub.id, TaskType.Gallery);
      sub.scrapsTaskNum = await db.getTaskNum(sub.id, TaskType.Scraps);
      this.updateSubList.push(sub);
      this.updateSubThrottle();
    }
  }

  async saveTask(
    task: Task,
    {
      sub,
      type,
      page,
      index
    }: { sub: Subscription; type: string; page: number; index: number }
  ) {
    await db.saveTask(task);
    this.addTaskList.push(task);
    await this.addTasksToAria();
    logger.log("作品详情", sub.id, type, page, index + 1);
  }
}
