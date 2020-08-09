import { getManager } from "typeorm";
import { app } from "electron";
import { Config, ConfigType } from "../entities/Config";

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
  "rpc-listen-port": number;
  "rpc-secret": string;
  split: number;
  "user-agent": string;
}

const defaultAriaConfig = {
  "all-proxy": "",
  "allow-overwrite": false,
  "auto-file-renaming": false,
  continue: true,
  dir: app.getPath("pictures"),
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

async function get(type: any, defaults: any = {}, options?: any) {
  const ret: any = await getManager().findOne(type, options);

  if (!ret) {
    return defaults;
  } else {
    return {
      ...defaults,
      ...JSON.parse(ret.data ?? "")
    };
  }
}

async function set(type: any, data: any, options?: any) {
  return await getManager().save(type, {
    ...options,
    data: JSON.stringify(data)
  });
}

/**
 * 获取配置
 */
async function getAriaConfig(): Promise<AriaConfig> {
  return await get(Config, defaultAriaConfig, {
    where: {
      id: 1,
      type: ConfigType.Aria
    }
  });
}

/**
 * 保存配置
 * @param data 配置
 */
async function saveAriaConfig(data: AriaConfig) {
  return await set(Config, data, {
    id: 1,
    type: ConfigType.Aria
  });
}

export const configService = {
  getAriaConfig,
  saveAriaConfig
};
