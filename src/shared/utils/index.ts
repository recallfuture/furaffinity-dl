import { app, remote } from "electron";
import is from "electron-is";

/**
 * 获取各平台对应的路径
 * @param name 路径别名
 */
export function getPath(name: string) {
  return is.renderer() ? remote.app.getPath(name) : app.getPath(name);
}

/**
 * 去除数组中的未定义值
 * @param arr 数组
 */
export function compactUndefined(arr: any[] = []): any[] {
  return arr.filter(value => value !== undefined);
}

/**
 * 合并任务结果
 * @param response 响应数据
 */
export function mergeTaskResult(response: any[] = []): any[] {
  let result: any[] = [];
  for (const res of response) {
    result = result.concat(...res);
  }
  return result;
}

export function convertNameToId(name: string): string {
  return name
    .split("_")
    .join("")
    .toLowerCase();
}
