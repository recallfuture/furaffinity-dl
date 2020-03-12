import ipc from "electron-promise-ipc";
import { Task, Subscription, Log } from "@/main/database/entity";
import { AriaConfig } from "@/main/database/service/config";
import { TasksStatus } from "@/shared/interface";

export async function getAriaConfig(): Promise<AriaConfig> {
  // @ts-ignore
  return await ipc.send("db.getAriaConfig");
}

export async function saveAriaConfig(config: AriaConfig) {
  // @ts-ignore
  return await ipc.send("db.saveAriaConfig", config);
}

export async function getSub(id: string): Promise<Subscription | undefined> {
  // @ts-ignore
  return await ipc.send("db.getSub", id);
}

export async function getSubs(): Promise<Subscription[]> {
  // @ts-ignore
  return await ipc.send("db.getSubs");
}

export async function getTasksStatus(id: string): Promise<TasksStatus> {
  // @ts-ignore
  return await ipc.send("db.getTasksStatus", id);
}

export async function getLogs(): Promise<Log[]> {
  // @ts-ignore
  return await ipc.send("db.getLogs");
}

export async function addSub(sub: Subscription) {
  // @ts-ignore
  return await ipc.send("db.addSub", sub);
}

export async function saveSubs(subs: Subscription[]) {
  // @ts-ignore
  return await ipc.send("db.saveSubs", subs);
}

export async function saveSub(sub: Subscription) {
  // @ts-ignore
  return await ipc.send("db.saveSub", sub);
}

export async function removeSub(id: string) {
  // @ts-ignore
  return await ipc.send("db.removeSub", id);
}

export async function clearLogs(id: string) {
  // @ts-ignore
  return await ipc.send("db.clearLogs", id);
}
