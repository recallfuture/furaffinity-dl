import Bluebird from "bluebird";

/**
 * 将配置对象转换为命令行参数数组
 * @param config 配置对象
 */
export function transformConfig(config: {}): string[] {
  let result = [];
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
export async function sleep(millisecond: number): Promise<void> {
  return new Bluebird(resolve => setTimeout(resolve, millisecond));
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