import { compactUndefined, mergeTaskResult } from "@/shared/utils";
import { AriaConfig } from "@/main/database/service/config";
import logger from "@/shared/logger";
// @ts-ignore
import Aria2 from "aria2";

// 客户端
let client: any = null;

// aria2 通知事件订阅
export function onDownloadStart(callback: Function) {
  client?.on("onDownloadStart", callback);
}

export function onDownloadPause(callback: Function) {
  client?.on("onDownloadPause", callback);
}

export function onDownloadStop(callback: Function) {
  client?.on("onDownloadStop", callback);
}

export function onDownloadComplete(callback: Function) {
  client?.on("onDownloadComplete", callback);
}

export function onDownloadError(callback: Function) {
  client?.on("onDownloadError", callback);
}

/**
 * 初始化客户端
 */
export async function initClient(config: AriaConfig) {
  const port = config["rpc-listen-port"];
  const host = "127.0.0.1";
  client = new Aria2({
    host,
    port
  });
  await client.open();
}

/**
 * 关闭客户端
 */
export async function closeClient() {
  await client.close();
  client = null;
}

/**
 * 获取版本号
 */
export async function getVersion() {
  return await client.call("getVersion");
}

/**
 * 修改 aria2 的全局配置
 * @param options 配置
 */
export async function changeGlobalOption(options: any) {
  return await client.call("changeGlobalOption", options);
}

/**
 * 获取 aria2 的全局配置
 */
export async function getGlobalOption() {
  return await client.call("getGlobalOption");
}

/**
 * 获取一个任务的配置
 * @param params 参数
 */
export async function getOption(params: any = {}) {
  const { gid } = params;
  return await client.call("getOption", ...compactUndefined([gid]));
}

/**
 * 修改一个任务的配置
 * @param params 参数
 */
export async function changeOption(params: any = {}) {
  let { gid, options = {} } = params;
  return await client.call("changeOption", ...compactUndefined([gid, options]));
}

/**
 * 获取全局状态
 */
export async function getGlobalStat() {
  return await client.call("getGlobalStat");
}

/**
 * 添加下载任务
 * @param params 参数
 */
export async function addUri(params: any = {}) {
  const { uris = [], options = {} } = params;
  return await client.call("aria2.addUri", uris, options);
}

/**
 * 获取下载中的任务列表
 * @param params 参数
 */
export async function fetchDownloadingTaskList(params: any = {}) {
  const { offset = 0, num = 20, keys } = params;

  try {
    const data = await client.multicall([
      ["aria2.tellActive", ...compactUndefined([keys])],
      ["aria2.tellWaiting", ...compactUndefined([offset, num, keys])]
    ]);
    logger.info("fetchDownloadingTaskList data", data);
    const result = mergeTaskResult(data);
    return result;
  } catch (e) {
    logger.error("fetchDownloadingTaskList fail===>", e);
  }
}

/**
 * 获取等待中的任务列表
 * @param params 参数
 */
export async function fetchWaitingTaskList(params: any = {}) {
  const { offset = 0, num = 20, keys } = params;
  return client.call("tellWaiting", ...compactUndefined([offset, num, keys]));
}

/**
 * 获取已停止的任务列表
 * @param params 参数
 */
export async function fetchStoppedTaskList(params: any = {}) {
  const { offset = 0, num = 20, keys } = params;
  return client.call("tellStopped", ...compactUndefined([offset, num, keys]));
}

/**
 * 获取某一种任务列表
 * @param params 参数
 */
export async function fetchTaskList(params: any = {}) {
  const { type } = params;
  switch (type) {
    case "active":
      return fetchDownloadingTaskList(params);
    case "waiting":
      return fetchWaitingTaskList(params);
    case "stopped":
      return fetchStoppedTaskList(params);
    default:
      return fetchDownloadingTaskList(params);
  }
}

/**
 * 获取单个任务详情
 * @param params 参数
 */
export async function fetchTaskItem(params: any = {}) {
  const { gid, keys } = params;
  return await client.call("tellStatus", ...compactUndefined([gid, keys]));
}

/**
 * 停止单个任务
 * @param params 参数
 */
export async function pauseTask(params: any = {}) {
  const { gid } = params;
  return await client.call("pause", ...compactUndefined([gid]));
}

/**
 * 停止所有任务
 */
export async function pauseAllTask() {
  return await client.call("pauseAll");
}

/**
 * 强制停止单个任务
 * @param params 参数
 */
export async function forcePauseTask(params: any = {}) {
  const { gid } = params;
  return await client.call("forcePause", ...compactUndefined([gid]));
}

/**
 * 强制停止所有任务
 */
export async function forcePauseAllTask() {
  return await client.call("forcePauseAll");
}

/**
 * 继续单个任务
 * @param params 参数
 */
export async function resumeTask(params: any = {}) {
  const { gid } = params;
  return await client.call("unpause", ...compactUndefined([gid]));
}

/**
 * 继续所有任务
 */
export async function resumeAllTask() {
  return await client.call("unpauseAll");
}

/**
 * 删除单个任务
 * @param params 参数
 */
export async function removeTask(params: any = {}) {
  const { gid } = params;
  return await client.call("remove", ...compactUndefined([gid]));
}

/**
 * 强制删除单个任务
 * @param params 参数
 */
export async function forceRemoveTask(params: any = {}) {
  const { gid } = params;
  return await client.call("forceRemove", ...compactUndefined([gid]));
}

/**
 * 删除所有任务
 */
export async function removeAllTask() {
  const status = await getGlobalStat();
  const tasks = await fetchWaitingTaskList({
    offset: 0,
    num: Number.parseInt(status.numWaiting),
    keys: ["gid"]
  });
  console.log("will remove", tasks);

  return await client.multicall(
    tasks.map((task: any) => {
      return ["remove", ...compactUndefined([task.gid])];
    })
  );
}

/**
 * 保存session
 */
export async function saveSession() {
  return await client.call("saveSession");
}

/**
 * 清空已结束的任务记录
 */
export async function purgeTaskRecord() {
  return await client.call("purgeDownloadResult");
}

/**
 * 移除单个任务记录
 * @param params 参数
 */
export async function removeTaskRecord(params: any = {}) {
  const { gid } = params;
  return client.call("removeDownloadResult", ...compactUndefined([gid]));
}
