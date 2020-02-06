import "reflect-metadata";
import {
  createConnection,
  getManager,
  getConnection,
  ConnectionOptions
} from "typeorm";
import { Subscription } from "../entity/Subscription";
import { Task } from "../entity/Task";
import { Log } from "../entity/Log";
import logger from "@/backup/shared/logger";

export * from "./config";

const config: ConnectionOptions = require("./ormconfig");

/**
 * 初始化
 */
export async function initDatabase() {
  await createConnection(config);
}

/**
 * 获取一个订阅
 * @param id 订阅id
 */
export async function getSub(id: string) {
  return getManager().findOne(Subscription, id);
}

/**
 * 获取所有的订阅
 */
export async function getSubs(): Promise<Subscription[]> {
  return getManager().find(Subscription);
}

/**
 * 获取某个任务
 * @param id 任务id
 */
export async function getTask(id: string): Promise<Task | undefined> {
  return getManager().findOne(Task, {
    where: { id }
  });
}

/**
 * 获取某个任务
 * @param id 任务id
 */
export async function getTaskByGid(gid: string): Promise<Task | undefined> {
  return getManager().findOne(Task, {
    where: { gid }
  });
}

/**
 * 获取某个订阅所有的作品
 * @param id 订阅id
 */
export async function getTasks(id: string): Promise<Task[]> {
  return getManager().find(Task, {
    where: { sub: id }
  });
}

/**
 * 获取某个订阅所有的作品
 * @param id 订阅id
 */
export async function getLogs(id: string): Promise<Log[]> {
  const count = await getManager().count(Log, { where: { sub: id } });
  return getManager().find(Log, {
    where: { sub: id },
    order: { createAt: "ASC" },
    skip: count > 100 ? count - 100 : 0
  });
}

/**
 * 添加订阅
 * @param sub 订阅
 */
export async function saveSub(sub: Subscription): Promise<Subscription> {
  const s = new Subscription();
  for (const key in sub) {
    // @ts-ignore
    s[key] = sub[key];
  }
  return getManager().save(s);
}

/**
 * 删除订阅
 * @param id 订阅id
 */
export async function removeSub(id: string) {
  await clearTasks(id);
  await clearLogs(id);
  return getManager().delete(Subscription, id);
}

/**
 * 批量添加订阅
 * @param subs 订阅
 */
export async function addSubs(subs: Subscription[]) {
  subs = subs.map(sub => {
    const s = new Subscription();
    for (const key in sub) {
      // @ts-ignore
      s[key] = sub[key];
    }
    return s;
  });
  await getManager().save(subs, { chunk: 500 });
}

/**
 * 添加一个任务
 * @param id 订阅id
 * @param task 任务
 */
export async function saveTask(task: Task): Promise<Task> {
  const t = new Task();
  for (const key in task) {
    // @ts-ignore
    t[key] = task[key];
  }
  return await getManager().save(t);
}

/**
 * 批量添加任务
 * @param tasks 任务
 */
export async function addTasks(tasks: Task[]) {
  await getManager().save(tasks, { chunk: 500 });
}

/**
 * 添加一条日志
 * @param id 订阅id
 * @param log 日志
 */
export async function addLog(log: Log): Promise<Log> {
  const l = new Log();
  for (const key in log) {
    // @ts-ignore
    l[key] = log[key];
  }
  return await getManager().save(l);
}

/**
 * 批量添加日志
 * @param logs 日志
 */
export async function addLogs(logs: Log[]) {
  return await getManager().save(logs, { chunk: 500 });
}

/**
 * 删除某一订阅的所有日志
 * @param id 订阅id
 */
export async function clearTasks(id: string) {
  return await getConnection()
    .createQueryBuilder()
    .delete()
    .from(Task)
    .where("subId = :id", { id })
    .execute();
}

/**
 * 删除某一订阅的所有日志
 * @param id 订阅id
 */
export async function clearLogs(id: string) {
  return await getConnection()
    .createQueryBuilder()
    .delete()
    .from(Log)
    .where("subId = :id", { id })
    .execute();
}
