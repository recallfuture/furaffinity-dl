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
