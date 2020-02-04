import { app } from "electron";
import is from "electron-is";
import { existsSync } from "fs";
import { resolve, join } from "path";
import { execFile, ChildProcess } from "child_process";
import logger from "../shared/logger";
import ariaNames from "./config/aria";
import { getAriaConfig } from "./database/service";

// aria2 启动实例
let instance: ChildProcess | null = null;

/**
 * 将配置对象转换为命令行参数数组
 * @param config 配置对象
 */
function transformConfig(config: {}): string[] {
  let result = [];
  for (const [k, v] of Object.entries(config)) {
    if (v !== "") {
      result.push(`--${k}=${v}`);
    }
  }
  return result;
}

/**
 * 获取 aria2 启动命令
 */
async function getStartSh(): Promise<string[]> {
  const { platform } = process;
  let basePath = resolve(app.getAppPath(), "..");

  // 开发时使用根目录下的 aria2
  if (is.dev()) {
    basePath = resolve(__dirname, `../extra/${platform}`);
  }

  // 获取各平台对应的可执行文件名
  const binName = (ariaNames as any)[platform];
  if (!binName) {
    logger.error("Aria2 does not support this platform");
    throw new Error("Aria2 does not support this platform");
  }

  // 检测 aria2 是否存在
  const binPath = join(basePath, `/aria2/${binName}`);
  const binIsExist = existsSync(binPath);
  if (!binIsExist) {
    logger.error("Aria2 bin is not exist===>", binPath);
    throw new Error("Aria2 is not exist");
  }

  // 获取配置路径和 session 路径
  const confPath = join(basePath, "/aria2/aria2.conf");
  const config = await getAriaConfig();

  // 生成命令
  let result = [
    `${binPath}`,
    `--conf-path=${confPath}`,
    ...transformConfig(config)
  ];

  return result;
}

// 启动 aria2
export async function start() {
  const sh = await getStartSh();
  logger.info("[Furaffinity-dl] Aria2 start sh===>", sh);
  instance = execFile(sh[0], sh.slice(1));
  logger.log(instance.pid);
  instance.on("error", err => {
    logger.error(`[Furaffinity-dl] Aria2 error===> ${err}`);
  });
  instance.on("close", code => {
    logger.info(`[Furaffinity-dl] Aria2 exit===> ${code}`);
  });
}

// 关闭 aria2
export async function stop() {
  try {
    logger.info("[Furaffinity-dl] Aria2 stopping===>" + instance?.pid);
    if (is.windows()) {
      instance?.kill("SIGINT");
    } else {
      instance?.kill("SIGTERM");
    }
  } catch (err) {
    logger.error("[Furaffinity-dl] Aria2 stop fail===>", err.message);
  }
}

// 重启 aria2
export async function restart() {
  await stop();
  await start();
}

export default {
  start,
  stop,
  restart
};
