import { getDataPath } from "@/shared/utils";
import Store from "electron-store";
import { AriaConfig, UserConfig } from "@/shared/interface";
import { app } from "electron";

const store = new Store({
  cwd: getDataPath()
});

/** aria config */

const defaultAriaConfig: AriaConfig = {
  "all-proxy": "",
  "allow-overwrite": false,
  "auto-file-renaming": false,
  continue: true,
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

export const getAriaConfig = () => ({
  ...defaultAriaConfig,
  ...((store.get("aria") as AriaConfig) || {})
});

export const saveAriaConfig = (config: AriaConfig) =>
  store.set("aria", { ...defaultAriaConfig, ...config });

/** user config */

const defaultUserConfig: UserConfig = {
  dir: app.getPath("picture")
};

export const getUserConfig = (): UserConfig => ({
  ...defaultUserConfig,
  ...((store.get("user") as UserConfig) || {})
});

export const saveUserConfig = (config: UserConfig) =>
  store.set("user", { ...defaultUserConfig, ...config });
