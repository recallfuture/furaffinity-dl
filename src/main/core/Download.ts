import { Task } from "@/main/database/entity";
import { AriaConfig } from "@/main/database/service/config";
import * as aria from "@/shared/aria";
import { AriaStatus } from "@/shared/interface";
import logger from "@/shared/logger";
import Bluebird from "bluebird";
import { EventEmitter } from "events";
import { ariaController, mainWindow } from "./index";

/**
 * 控制aria进行下载的类
 */
export class Download extends EventEmitter {
  private gidTask: Map<string, Task> = new Map();
  private errorTasks: Task[] = [];

  private ariaStatus: AriaStatus = {
    downloadSpeed: "0",
    numActive: "0",
    numStopped: "0",
    numStoppedTotal: "0",
    numWaiting: "0",
    uploadSpeed: "0"
  };

  /**
   * 是否已完成下载
   */
  get isComplete() {
    return !(
      Number.parseInt(this.ariaStatus.numActive) + Number.parseInt(this.ariaStatus.numWaiting)
    );
  }

  /**
   * 获取aria全局状态
   */
  get globalStat() {
    return this.ariaStatus;
  }

  /**
   * 初始化aria
   * @param config aria配置
   */
  async init(config: AriaConfig) {
    await aria.initClient(config);

    aria.onDownloadStart((event: any) => this.handleDownloadStart(event));
    aria.onDownloadStop((event: any) => this.handleDownloadStop(event));
    aria.onDownloadComplete((event: any) => this.handleDownloadComplete(event));
    aria.onDownloadError((event: any) => this.handleDownloadError(event));
    aria.onDownloadPause((event: any) => this.handleDownloadPause(event));

    const updater = setInterval(async () => {
      try {
        this.ariaStatus = await aria.getGlobalStat();
      } catch (e) {
        clearInterval(updater);
        if (mainWindow.win) {
          await ariaController.start();
          await this.init(config);
          this.addErrorTasks();
        }
      }
    }, 200);
  }

  /**
   * 添加下载任务
   * @param task 任务
   */
  async add(task: Task) {
    try {
      // 保存位置
      const dir = task.type === "gallery" ? task.sub?.galleryDir : task.sub?.scrapsDir;
      // 保存gid
      const gid = await aria.addUri({
        uris: [task.downloadUrl],
        options: { dir }
      });
      // 添加缓存
      task.gid = gid;
      this.gidTask.set(gid, task);
      this.emit("task.add", task);
    } catch (e) {
      this.errorTasks.push(task);
      logger.error("Add task error", e);
    }
  }

  /**
   * 停止下载
   */
  async stop() {
    await aria.removeAllTask();
  }

  /**
   * 清理下载记录
   */
  async clean() {
    await aria.purgeTaskRecord();
  }

  /**
   * 等待下载完成
   */
  async waitForComplete() {
    return new Bluebird(resolve => {
      const fun = () => {
        if (this.isComplete) {
          resolve();
        } else {
          setTimeout(fun, 100);
        }
      };
      fun();
    });
  }

  /**
   * 添加错误的任务
   */
  private async addErrorTasks() {
    const tasks = [...this.errorTasks];
    this.errorTasks = [];
    for (const task of tasks) {
      logger.log("Add error task");
      await this.add(task);
    }
  }

  private async handleDownloadStart(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "active");
    logger.log("任务开始", gid);
  }

  private async handleDownloadComplete(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "complete");
    logger.log("任务完成", gid);
  }

  private async handleDownloadPause(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "paused");
    logger.log("任务暂停", gid);
  }

  private async handleDownloadStop(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "stopped");
    logger.log("任务停止", gid);
  }

  private async handleDownloadError(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid, "error");
    logger.error("任务失败", gid);
  }

  /**
   * 更新任务信息
   * @param gid 任务gid
   * @param status 任务状态
   */
  private async refreshTask(gid: string, status: string) {
    if (this.gidTask.has(gid)) {
      // 获取任务信息
      const task = this.gidTask.get(gid);
      if (!task) {
        return;
      }

      // 覆盖任务状态
      task.status = status;
      // 覆盖文件位置
      // 任务完成后可以或得到文件位置
      if (status === "complete") {
        const item = await aria.fetchTaskItem({ gid });
        task.path = item.files[0].path;
        logger.log("文件下载到", item.files[0].path);
      }
      if (status === "error") {
        logger.error("download error", gid, task.id);
      }
      if (status !== "active") {
        this.gidTask.delete(gid);
      }
      this.emit("task.update", task);
    }
  }
}
