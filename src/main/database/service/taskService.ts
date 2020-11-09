import { getConnection, getManager } from "typeorm";
import { Task, TaskType } from "../entities/Task";

/**
 * 获取某个任务
 * @param id 任务id
 */
export async function getTask(id: string): Promise<Task | undefined> {
  return await getManager().findOne(Task, {
    where: { id }
  });
}

/**
 * 获取某个任务
 * @param gid 任务gid
 */
export function getTaskByGid(gid: string): Promise<Task | undefined> {
  return getManager().findOne(Task, {
    where: { gid },
    relations: ["sub"]
  });
}

/**
 * 添加一个任务
 * @param task 任务
 */
export async function saveTask(task: Task): Promise<Task> {
  return await getManager().save(task);
}

/**
 * 获取一个订阅的作品数量
 * @param id 订阅id
 */
export async function getTaskNum(id: string, type: TaskType, status?: string) {
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
export function getTasks(id: string): Promise<Task[]> {
  return getManager().find(Task, {
    where: { sub: id }
  });
}

/**
 * 批量添加任务
 * @param tasks 任务列表
 */
export async function saveTasks(tasks: Task[]) {
  return await getManager().save(tasks, { chunk: 500 });
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

export default {
  getTask,
  getTaskByGid,
  getTasks,
  saveTask,
  saveTasks,
  clearTasks
};
