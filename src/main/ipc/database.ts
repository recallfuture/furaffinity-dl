import ipc from "electron-promise-ipc";
import { db } from "../core";
import { Subscription, Task } from "@/main/database/entity";
import { transformSub, transformSubs, transformTask } from "@/shared/utils";

async function saveSub(sub: Subscription) {
  return await db.saveSub(transformSub(sub));
}

async function saveSubs(subs: Subscription[]) {
  return await db.saveSubs(transformSubs(subs));
}

async function saveTask(task: Task) {
  return await db.saveTask(transformTask(task));
}

export function registerDatabaseIpc() {
  ipc.on("db.getAriaConfig", db.getAriaConfig);
  ipc.on("db.saveAriaConfig", db.saveAriaConfig as any);
  ipc.on("db.getSub", db.getSub as any);
  ipc.on("db.getSubs", db.getSubs);
  ipc.on("db.getTask", db.getTask as any);
  ipc.on("db.getTaskByGid", db.getTaskByGid as any);
  ipc.on("db.getTasks", db.getTasks as any);
  ipc.on("db.getLogs", db.getLogs as any);

  ipc.on("db.addSub", saveSub as any);
  ipc.on("db.saveSub", saveSub as any);
  ipc.on("db.saveSubs", saveSubs as any);
  ipc.on("db.removeSub", (id: any) => db.removeSub(id));
  ipc.on("db.addTask", saveTask as any);
  ipc.on("db.saveTask", saveTask as any);
}
