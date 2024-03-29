import { app, remote } from "electron";
import is from "electron-is";
import path from "path";

/**
 * 获取数据存储路径
 */
export const getDataPath = (): string => {
  const currentApp = is.main() ? app : remote.app;
  return process.env.NODE_ENV === "production"
    ? path.join(currentApp.getPath("documents"), "Furaffinity-dl")
    : path.join(".", ".data");
};

/**
 * 获取上下文中的所有导出模块
 * @param context 上下文
 */
export const requireAll = (
  context: __WebpackModuleApi.RequireContext
): unknown[] => {
  return context
    .keys()
    .reduce((prev, curr) => prev.concat(Object.values(context(curr))), []);
};

/**
 * 异步休眠一段时间
 * @param millisecond 休眠的毫秒数
 */
export const sleep = (millisecond: number): Promise<unknown> =>
  new Promise((resole) => {
    setTimeout(() => {
      resole(millisecond);
    }, millisecond);
  });

/**
 * 用户名转用户id
 * @param name 用户名
 */
export function convertNameToId(name: string): string {
  return name.split("_").join("").toLowerCase();
}
