import { getPath } from "@/backup/shared/utils";
import logger from "@/backup/shared/logger";
import { findOne, updateOrAdd } from "./api";
import { AriaConfig } from "./interfaces";

/**
 * 获取配置默认值
 */
export function getDefault(): AriaConfig {
  return {
    "all-proxy": "",
    "allow-overwrite": false,
    "auto-file-renaming": false,
    continue: true,
    dir: getPath("pictures"),
    "max-concurrent-downloads": 8,
    "max-connection-per-server": 16,
    "max-download-limit": 0,
    "max-overall-download-limit": 0,
    "max-overall-upload-limit": 0,
    "min-split-size": "1M",
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
  logger.info("Get config: ", result);

  return result;
}

/**
 * 保存配置
 * @param data 配置
 */
export async function set(data: AriaConfig) {
  await updateOrAdd({ type: "AriaConfig" }, { type: "AriaConfig", data });
  logger.info("Save config: ", data);
}

export default {
  get,
  getDefault,
  set
};
