import { getDataPath } from "@/main/utils";
import Store from "electron-store";
import { UserConfig } from "@/shared/interface";
import { app } from "electron";

const store = new Store({
  cwd: getDataPath(),
});

/** user config */
const defaultUserConfig: UserConfig = {
  dir: app.getPath("pictures"),
};

export const getUserConfig = (): UserConfig => ({
  ...defaultUserConfig,
  ...((store.get("userConfig") as UserConfig) || {}),
});

export const saveUserConfig = (config: UserConfig): void =>
  store.set("userConfig", { ...defaultUserConfig, ...config });
