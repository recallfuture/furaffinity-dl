import { dialog, ipcMain } from "electron";

/**
 * 打开选择文件夹的对话框
 * 返回文件夹路径
 */
const openFolderDialog = async (): Promise<string[] | undefined> => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "multiSelections"],
  });
  return result.filePaths;
};

const warp = (fn: Function) => (_: any, ...args: any[]) => fn(...args);

export const registerAppIpc = (): void => {
  ipcMain.on("app.openFolderDialog", warp(openFolderDialog));
};
