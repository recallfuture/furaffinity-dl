import logger from "@/shared/logger";
import { sleep } from "@/shared/utils";
import Bluebird from "bluebird";
import ipc from "electron-promise-ipc";
import fs from "fs";
import { promisify } from "util";
import { Gallery, Result, Scraps, Submission } from "furaffinity-api";
import { Submission as ISubmission } from "furaffinity-api/dist/interfaces";
import { Log, Subscription, Task } from "../database/entity";
import { db } from "./";
import { mainWindow } from "./index";

const existsAsync = promisify(fs.exists);

function send(route: string, ...args: any) {
  if (mainWindow.win) {
    ipc.send(route, mainWindow.win.webContents, ...args);
  }
}

/**
 * 获取订阅内的作品类
 */
export class Fetch {
  private fetching: boolean = false;
  private maxRetry: number = 3;

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
  stop() {
    this.fetching = false;
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

    await db.addLog(log);
    send("log.update", sub.id);
  }

  /**
   * 清空某订阅的日志
   * @param id 订阅id
   */
  private async clearLogs(id: string) {
    await db.clearLogs(id);
    send("log.update", id);
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
   * 遍历订阅下载列表
   * @param subs 订阅列表
   */
  async mapSubs(subs: Subscription[]) {
    // 获取当前订阅
    for (const sub of subs) {
      sub.status = "active";
      await db.saveSub(sub);
      send("sub.update", sub.id);
      await this.clearLogs(sub.id);

      // 下载的图集
      const types: any = { gallery: sub.gallery, scraps: sub.scraps };
      for (const type in types) {
        if (!types[type] || !this.fetching) {
          continue;
        }

        try {
          // 下载此图集的所有图片
          this.addLog(sub, { message: `[${type}] 开始获取` });
          await this.mapPages(type, { sub });
        } catch (e) {
          this.addLog(sub, {
            type: "error",
            message: `[${type}] 出现错误，停止获取：${e.message}`
          });
          logger.error(e);
        }
      }
      sub.status = "";
      await db.saveSub(sub);
      send("sub.update", sub.id);
    }
  }

  /**
   * 遍历所有页
   * @param type 类型
   * @param param1 附加参数
   */
  async mapPages(type: string, { sub }: { sub: Subscription }) {
    for (let page = 1; this.fetching; page++) {
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
      logger.log("result");
      const result: Result[] | null = await this.retry(fun, error);
      if (result === null) {
        throw new Error("获取作品列表失败");
      }

      if (result.length === 0) {
        this.addLog(sub, { message: `[${type}] 获取结束` });
        logger.log("页数到头了", sub, type, page);
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
  async mapSubmissions(
    submissions: Result[],
    { sub, type, page }: { sub: Subscription; type: string; page: number }
  ) {
    for (let index = 0; index < submissions.length && this.fetching; index++) {
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
        logger.log("跳过作品", sub.id, type, page, index + 1, task);
        continue;
      }

      if (task) {
        task.gid = "";
        task.path = "";
        task.type = type;
        task.sub = sub;

        await db.saveTask(task);
        send("task.add", task);
        logger.log("作品详情", sub.id, type, page, index + 1, task);
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

      // 创建新任务并保存
      const t = new Task();
      t.gid = "";
      t.id = detail.id;
      t.downloadUrl = detail.downloadUrl;
      t.url = detail.url;
      t.sub = sub;
      t.type = type;

      await db.saveTask(t);
      send("task.add", t);
      logger.log("作品详情", sub.id, type, page, index + 1, t);

      // 更新数量
      if (type === "gallery") {
        sub.galleryTaskNum++;
      } else {
        sub.scrapsTaskNum++;
      }
      await db.saveSub(sub);
      send("sub.update", sub.id);
    }
  }
}
