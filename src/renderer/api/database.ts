import ipc from "electron-promise-ipc";
import { Task, Subscription, Log } from "@/main/database/entity";
import { AriaConfig } from "@/main/database/service/config";

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

export async function getTask(id: string): Promise<Task | undefined> {
  // @ts-ignore
  return await ipc.send("db.getTask", id);
}

export async function getTaskByGid(gid: string): Promise<Task | undefined> {
  // @ts-ignore
  return await ipc.send("db.getTaskByGid", gid);
}

export async function getTasks(id: string): Promise<Task[]> {
  // @ts-ignore
  return await ipc.send("db.getTasks", id);
}

export async function getLogs(id: string): Promise<Log[]> {
  // @ts-ignore
  return await ipc.send("db.getLogs", id);
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

export async function addTask(task: Task) {
  // @ts-ignore
  return await ipc.send("db.addTask", task);
}

export async function saveTask(task: Task) {
  // @ts-ignore
  return await ipc.send("db.saveTask", task);
}

export async function addTaks(tasks: Task[]) {
  // @ts-ignore
  return await ipc.send("db.addTasks", tasks);
}

export async function addLog(log: Log) {
  // @ts-ignore
  return await ipc.send("db.addLog", log);
}

export async function addLogs(logs: Log[]) {
  // @ts-ignore
  return await ipc.send("db.addLogs", logs);
}

export async function clearLogs(id: string) {
  // @ts-ignore
  return await ipc.send("db.clearLogs", id);
}
