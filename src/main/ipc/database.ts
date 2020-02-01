import ipc from "electron-promise-ipc";
import * as db from "../database/service";

export function registerDatabaseIpc() {
  ipc.on("db.getAriaConfig", db.getAriaConfig);
  ipc.on("db.saveAriaConfig", db.saveAriaConfig as any);
  ipc.on("db.getSub", db.getSub as any);
  ipc.on("db.getSubs", db.getSubs);
  ipc.on("db.getTasks", db.getTasks as any);
  ipc.on("db.getLogs", db.getLogs as any);

  ipc.on("db.addSub", db.addSub as any);
  ipc.on("db.addTask", db.addTask as any);
  ipc.on("db.addTasks", db.addTasks as any);
  ipc.on("db.addLog", db.addLog as any);
  ipc.on("db.addLogs", db.addLogs as any);

  // TODO: 删除多余的log
  // 删除所有的log
  // 删除订阅
  // 修改订阅
  // 更新任务状态
}
