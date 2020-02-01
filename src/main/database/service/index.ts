import "reflect-metadata";
import {
  createConnection,
  getManager,
  getConnection,
  ConnectionOptions
} from "typeorm";
import { Subscription } from "../entity/Subscription";
import { Task, TaskType } from "../entity/Task";
import { Log } from "../entity/Log";
import db from "../";
import logger from "@/shared/logger";

const config: ConnectionOptions = require("./ormconfig");

/**
 * 初始化
 */
export async function init() {
  await createConnection(config);
}

/**
 * 获取一个订阅
 * @param id 订阅id
 */
export async function getSub(id: string) {
  return getManager().findOne(Subscription, id, { relations: ["author"] });
}

/**
 * 获取所有的订阅
 */
export async function getSubs(): Promise<Subscription[]> {
  return getManager().find(Subscription, { relations: ["author"] });
}

/**
 * 获取某个订阅所有的作品
 * @param id 订阅id
 */
export async function getTasks(id: string): Promise<Task[]> {
  return getManager().find(Task, {
    relations: ["author"],
    where: {
      sub: id
    }
  });
}

/**
 * 获取某个订阅所有的作品
 * @param id 订阅id
 */
export async function getLogs(id: string): Promise<Log[]> {
  return getManager().find(Log, {
    relations: ["author"],
    where: {
      sub: id
    }
  });
}

/**
 * 添加订阅
 * @param sub 订阅
 */
export async function addSub(sub: Subscription): Promise<Subscription> {
  return getManager().save(sub);
}

/**
 * 添加一个任务
 * @param id 订阅id
 * @param task 任务
 */
export async function addTask(id: string, task: Task): Promise<Task> {
  task = await getManager().save(task);
  await getConnection()
    .createQueryBuilder()
    .relation(Subscription, "tasks")
    .of(id)
    .add(task);
  return task;
}

/**
 * 批量添加任务
 * @param tasks 任务
 */
export async function addTasks(tasks: Task[]) {
  return await getManager().save(tasks, { chunk: 500 });
}

/**
 * 添加一条日志
 * @param id 订阅id
 * @param log 日志
 */
export async function addLog(id: string, log: Log): Promise<Log> {
  log = await getManager().save(log);
  await getConnection()
    .createQueryBuilder()
    .relation(Subscription, "logs")
    .of(id)
    .add(log);
  return log;
}

/**
 * 批量添加日志
 * @param logs 日志
 */
export async function addLogs(logs: Log[]) {
  return await getManager().save(logs, { chunk: 500 });
}

export async function migrate() {
  const subs = await db.subscription.getAll();
  console.log(subs.length);
  let index = 1;

  for (const sub of subs) {
    try {
      const s = new Subscription();
      s.id = sub.author.id;
      s.name = sub.author.name;
      s.avatar = sub.author.avatar;
      s.dir = sub.dir;
      s.createAt = sub.createAt;
      s.gallery = sub.gallery;
      s.galleryDir = sub.galleryDir;
      s.scraps = sub.scraps;
      s.scrapsDir = sub.scrapsDir;
      s.status = sub.status;
      await addSub(s);
      logger.log("添加新订阅", s.id, `${index++}/${subs.length}`);

      await addTasks(
        sub.galleryTasks.map(task => {
          const t = new Task();
          t.id = task.id;
          t.gid = task.gid;
          t.path = task.path;
          t.status = task.status;
          t.type = TaskType.Gallery;
          t.url = task.url;
          t.downloadUrl = task.downloadUrl;
          t.sub = s;
          return t;
        })
      );
      await addTasks(
        sub.scrapsTasks.map(task => {
          const t = new Task();
          t.id = task.id;
          t.gid = task.gid;
          t.path = task.path;
          t.status = task.status;
          t.type = TaskType.Scraps;
          t.url = task.url;
          t.downloadUrl = task.downloadUrl;
          t.sub = s;
          return t;
        })
      );

      logger.log(
        "任务添加完成",
        sub.galleryTasks.length + sub.scrapsTasks.length
      );
    } catch (e) {
      logger.error(e);
    }
  }
}
