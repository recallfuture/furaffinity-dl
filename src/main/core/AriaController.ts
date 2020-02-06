import { app } from "electron";
import is from "electron-is";
import { existsSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { execFile, ChildProcess } from "child_process";
import logger from "@/shared/logger";
import ariaNames from "../config/aria";
import { db } from ".";
import { transformConfig } from "@/shared/utils";

/**
 * Aria2 控制类
 */
export class AriaController {
  instance: ChildProcess | null = null;

  /**
   * 获取 aria2 启动命令
   */
  async getStartSh(): Promise<string[]> {
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
    const config = await db.getAriaConfig();

    const sessionDir = join(app.getPath("documents"), "Furaffinity-dl");
    if (!existsSync(sessionDir)) {
      mkdirSync(sessionDir);
    }

    const sessionPath = join(sessionDir, "aria2.session");
    const sessionIsExist = existsSync(sessionPath);

    // 生成命令
    const result = [
      `${binPath}`,
      `--conf-path=${confPath}`,
      `--save-session=${sessionPath}`,
      ...transformConfig(config)
    ];

    if (sessionIsExist) {
      result.push(`--input-file=${sessionPath}`);
    }

    return result;
  }

  /**
   * 启动 aria2
   */
  async start() {
    const sh = await this.getStartSh();
    logger.info("[Furaffinity-dl] Aria2 start sh===>", sh);
    this.instance = execFile(sh[0], sh.slice(1));
    this.instance.on("error", err => {
      logger.error(`[Furaffinity-dl] Aria2 error===> ${err}`);
    });
    this.instance.on("close", code => {
      logger.info(`[Furaffinity-dl] Aria2 exit===> ${code}`);
    });
  }

  /**
   * 关闭 aria2
   */
  async stop() {
    try {
      logger.info("[Furaffinity-dl] Aria2 stopping===>" + this.instance?.pid);
      if (is.windows()) {
        this.instance?.kill("SIGINT");
      } else {
        this.instance?.kill("SIGTERM");
      }
    } catch (err) {
      logger.error("[Furaffinity-dl] Aria2 stop fail===>", err.message);
    }
  }

  /**
   * 重启 aria2
   */
  async restart() {
    await this.stop();
    await this.start();
  }
}
