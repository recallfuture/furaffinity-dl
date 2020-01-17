import { app } from "electron";
import logger from "../logger";
import { findOne, updateOrAdd } from "./index";

interface UserConfig {
  defaultDownloadPath: string;
}

/**
 * 获取配置默认值
 */
export function getDefault(): UserConfig {
  return {
    defaultDownloadPath: app.getPath("pictures")
  };
}

/**
 * 获取配置
 */
export async function get(): Promise<UserConfig> {
  const doc: any = await findOne({ type: "UserConfig" });
  let result: UserConfig;

  if (!doc) {
    // 如果找不到就获取默认配置，然后保存
    result = getDefault();
    await set(result);
  } else {
    result = { ...getDefault(), ...doc.data } as UserConfig;
  }
  logger.info("Get config: " + JSON.stringify(result));

  return result;
}

/**
 * 保存配置
 * @param data 配置
 */
export async function set(data: UserConfig) {
  await updateOrAdd({ type: "UserConfig" }, { type: "UserConfig", data });
  logger.info("Save config: " + JSON.stringify(data));
}

export default {
  get,
  getDefault,
  set
};
