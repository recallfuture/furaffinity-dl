import { app } from "electron";
import path from "path";

/**
 * 获取数据存储路径
 */
export const getDataPath = () => {
  return process.env.NODE_ENV === "production"
    ? path.join(app.getPath("documents"), "Furaffinity-dl")
    : path.join(".", ".data");
};

/**
 * 将配置对象转换为命令行参数数组
 * @param config 配置对象
 */
export function transformConfig(config: {}): string[] {
  const result = [];
  for (const [k, v] of Object.entries(config)) {
    if (v !== "") {
      result.push(`--${k}=${v}`);
    }
  }
  return result;
}

/**
 * 异步休眠一段时间
 * @param millisecond 休眠的毫秒数
 */
export const sleep = (millisecond: number) =>
  new Promise(resole => {
    setTimeout(() => {
      resole(millisecond);
    }, millisecond);
  });

/**
 * 用户名转用户id
 * @param name 用户名
 */
export function convertNameToId(name: string): string {
  return name
    .split("_")
    .join("")
    .toLowerCase();
}
