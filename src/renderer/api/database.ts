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

export async function getSub(id: string): Promise<Subscription> {
  // @ts-ignore
  return await ipc.send("db.getSub", id);
}

export async function getSubs(): Promise<Subscription[]> {
  // @ts-ignore
  return await ipc.send("db.getSubs");
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

export async function addTask(id: string, task: Task) {
  // @ts-ignore
  return await ipc.send("db.addTask", id, task);
}

export async function addTaks(tasks: Task[]) {
  // @ts-ignore
  return await ipc.send("db.addTasks", tasks);
}

export async function addLog(id: string, log: Log) {
  // @ts-ignore
  return await ipc.send("db.addLog", id, log);
}

export async function addLogs(logs: Log[]) {
  // @ts-ignore
  return await ipc.send("db.addLogs", logs);
}
