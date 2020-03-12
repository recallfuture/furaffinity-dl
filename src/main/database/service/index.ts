import "reflect-metadata";
import { createConnection, getManager, getConnection } from "typeorm";
import { Log, Subscription, Task } from "../entity";
import * as Config from "./config";
import { AriaConfig } from "./config";
import { TaskType } from "../entity/Task";

export { AriaConfig };

export class Database {
  /**
   * 连接数据库
   */
  async create() {
    return await createConnection(require("./ormconfig"));
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    return await getConnection().close();
  }

  // ---------------- Subscription begin ---------------
  /**
   * 获取一个订阅
   * @param id 订阅id
   */
  async getSub(id: string) {
    return await getManager().findOne(Subscription, id);
  }

  /**
   * 添加订阅
   * @param sub 订阅
   */
  async saveSub(sub: Subscription): Promise<Subscription> {
    return await getManager().save(sub);
  }

  /**
   * 删除订阅
   * @param id 订阅id
   */
  async removeSub(id: string) {
    await this.clearTasks(id);
    return await getManager().delete(Subscription, id);
  }

  /**
   * 获取所有的订阅
   */
  async getSubs(): Promise<Subscription[]> {
    return await getManager().find(Subscription);
  }

  /**
   * 批量添加订阅
   * @param subs 订阅
   */
  async saveSubs(subs: Subscription[]) {
    return await getManager().save(subs, { chunk: 500 });
  }

  // ---------------- Subscription end ---------------

  // ---------------- Task begin ---------------------
  /**
   * 获取某个任务
   * @param id 任务id
   */
  async getTask(id: string): Promise<Task | undefined> {
    return await getManager().findOne(Task, {
      where: { id }
    });
  }

  /**
   * 获取某个任务
   * @param gid 任务gid
   */
  getTaskByGid(gid: string): Promise<Task | undefined> {
    return getManager().findOne(Task, {
      where: { gid },
      relations: ["sub"]
    });
  }

  /**
   * 添加一个任务
   * @param task 任务
   */
  async saveTask(task: Task): Promise<Task> {
    return await getManager().save(task);
  }

  /**
   * 获取一个订阅的作品数量
   * @param id 订阅id
   */
  async getTaskNum(id: string, type: TaskType, status?: string) {
    if (typeof status === "undefined") {
      return await getManager().count(Task, {
        where: { sub: id, type }
      });
    } else {
      return await getManager().count(Task, {
        where: { sub: id, type, status }
      });
    }
  }

  /**
   * 获取某个订阅所有的作品
   * @param id 订阅id
   */
  getTasks(id: string): Promise<Task[]> {
    return getManager().find(Task, {
      where: { sub: id }
    });
  }

  /**
   * 批量添加任务
   * @param tasks 任务列表
   */
  async saveTasks(tasks: Task[]) {
    return await getManager().save(tasks, { chunk: 500 });
  }

  /**
   * 删除某一订阅的所有日志
   * @param id 订阅id
   */
  async clearTasks(id: string) {
    return await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Task)
      .where("subId = :id", { id })
      .execute();
  }
  // ---------------- Task end -----------------------

  // ---------------- Log begin ----------------------
  /**
   * 添加一条日志
   * @param id 订阅id
   * @param log 日志
   */
  async addLog(log: Log): Promise<Log> {
    return await getManager().save(log);
  }

  /**
   * 获取所有日志
   */
  async getLogs(): Promise<Log[]> {
    return await getManager().find(Log, {
      order: { createAt: "ASC" }
    });
  }

  /**
   * 批量添加日志
   * @param logs 日志
   */
  async addLogs(logs: Log[]) {
    return await getManager().save(logs, { chunk: 500 });
  }

  /**
   * 删除某一订阅的所有日志
   * @param id 订阅id
   */
  async clearLogs() {
    return await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Log)
      .execute();
  }
  // ---------------- Log end ------------------------

  // ---------------- AriaConfig begin ---------------
  /**
   * 获取Aria2配置
   */
  async getAriaConfig(): Promise<AriaConfig> {
    return await Config.getAriaConfig();
  }

  /**
   * 保存Aria2配置
   * @param config 配置
   */
  async saveAriaConfig(config: AriaConfig) {
    return await Config.saveAriaConfig(config);
  }
  // ---------------- AriaConfig end -----------------
}
