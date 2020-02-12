import ipc from "electron-promise-ipc";
import { db } from "../core";
import { Subscription, Task } from "@/main/database/entity";
import { TaskType, TaskStatus } from "../database/entity/Task";
import { TasksStatus } from "../../shared/interface";
import {
  transformSub,
  transformSubs,
  transformTask,
  transformTasks
} from "@/shared/utils";

async function saveSub(sub: Subscription) {
  return await db.saveSub(transformSub(sub));
}

async function saveSubs(subs: Subscription[]) {
  return await db.saveSubs(transformSubs(subs));
}

async function saveTask(task: Task) {
  return await db.saveTask(transformTask(task));
}

async function saveTasks(tasks: Task[]) {
  return await db.saveTasks(transformTasks(tasks));
}

async function getTasksStatus(id: string) {
  const gallery = await db.getTaskNum(id, TaskType.Gallery);
  const galleryComplete = await db.getTaskNum(
    id,
    TaskType.Gallery,
    TaskStatus.Complete
  );
  const galleryActive = await db.getTaskNum(
    id,
    TaskType.Gallery,
    TaskStatus.Active
  );
  const scraps = await db.getTaskNum(id, TaskType.Scraps);
  const scrapsComplete = await db.getTaskNum(
    id,
    TaskType.Scraps,
    TaskStatus.Complete
  );
  const scrapsActive = await db.getTaskNum(
    id,
    TaskType.Scraps,
    TaskStatus.Active
  );
  return {
    gallery,
    galleryComplete,
    galleryActive,
    scraps,
    scrapsComplete,
    scrapsActive
  } as TasksStatus;
}

export function registerDatabaseIpc() {
  ipc.on("db.getAriaConfig", db.getAriaConfig);
  ipc.on("db.saveAriaConfig", db.saveAriaConfig as any);
  ipc.on("db.getSub", db.getSub as any);
  ipc.on("db.getSubs", db.getSubs);
  ipc.on("db.getTasksStatus", getTasksStatus as any);
  ipc.on("db.getLogs", db.getLogs as any);

  ipc.on("db.addSub", saveSub as any);
  ipc.on("db.saveSub", saveSub as any);
  ipc.on("db.saveSubs", saveSubs as any);
  ipc.on("db.removeSub", (id: any) => db.removeSub(id));
}
