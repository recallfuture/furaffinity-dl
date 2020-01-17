import { app } from "electron";
import logger from "../logger";
import { findOne, updateOrAdd } from "./index";

interface AriaConfig {
  "all-proxy": string;
  "allow-overwrite": boolean;
  "auto-file-renaming": boolean;
  continue: boolean;
  dir: string;
  "max-concurrent-downloads": number;
  "max-connection-per-server": number;
  "max-download-limit": number | string;
  "max-overall-download-limit": number | string;
  "max-overall-upload-limit": number | string;
  "min-split-size": string;
  pause: boolean;
  "rpc-listen-port": number;
  "rpc-secret": string;
  split: number;
  "user-agent": string;
}

/**
 * 获取配置默认值
 */
export function getDefault(): AriaConfig {
  return {
    "all-proxy": "",
    "allow-overwrite": true,
    "auto-file-renaming": false,
    continue: true,
    dir: app.getPath("pictures"),
    "max-concurrent-downloads": 8,
    "max-connection-per-server": 16,
    "max-download-limit": 0,
    "max-overall-download-limit": 0,
    "max-overall-upload-limit": 0,
    "min-split-size": "1M",
    pause: false,
    "rpc-listen-port": 6868,
    "rpc-secret": "",
    split: 16,
    "user-agent": "Transmission/2.94"
  };
}

/**
 * 获取配置
 */
export async function get(): Promise<AriaConfig> {
  const doc: any = await findOne({ type: "AriaConfig" });
  let result: AriaConfig;

  if (!doc) {
    // 如果找不到就获取默认配置，然后保存
    result = getDefault();
    await set(result);
  } else {
    result = { ...getDefault(), ...doc.data } as AriaConfig;
  }
  logger.info("Get config: " + JSON.stringify(result));

  return result;
}

/**
 * 保存配置
 * @param data 配置
 */
export async function set(data: AriaConfig) {
  await updateOrAdd({ type: "AriaConfig" }, { type: "AriaConfig", data });
  logger.info("Save config: " + JSON.stringify(data));
}

export default {
  get,
  getDefault,
  set
};
