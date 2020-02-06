import { getPath } from "@/backup/shared/utils";
import logger from "@/backup/shared/logger";
import { getManager } from "typeorm";
import { Config, ConfigType } from "../entity/Config";

export interface AriaConfig {
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
  "rpc-listen-port": number;
  "rpc-secret": string;
  split: number;
  "user-agent": string;
}

export interface UserConfig { }

/**
 * 获取配置默认值
 */
export function getDefaultAriaConfig(): AriaConfig {
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
export async function getAriaConfig(): Promise<AriaConfig> {
  const config = await getManager().findOne(Config, {
    where: {
      type: ConfigType.Aria
    }
  });

  let result: AriaConfig | undefined;

  if (!config) {
    // 如果找不到就获取默认配置，然后保存
    result = getDefaultAriaConfig();
    await getManager().insert(Config, {
      type: ConfigType.Aria,
      data: JSON.stringify(result)
    });
  } else {
    result = {
      ...getDefaultAriaConfig(),
      ...JSON.parse(config.data ?? "")
    } as AriaConfig;
  }
  logger.info("Get config: ", result);

  return result;
}

/**
 * 保存配置
 * @param data 配置
 */
export async function saveAriaConfig(data: AriaConfig) {
  const config = await getManager().findOne(Config, {
    where: {
      type: ConfigType.Aria
    }
  });
  if (!config) {
    await getManager().insert(Config, {
      type: ConfigType.Aria,
      data: JSON.stringify({ ...getDefaultAriaConfig(), ...data })
    });
  } else {
    config.data = JSON.stringify({ ...getDefaultAriaConfig(), ...data });
    await getManager().save(config);
  }
  logger.info("Save config: ", data);
}
