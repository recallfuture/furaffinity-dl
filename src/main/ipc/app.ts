import { dialog } from "electron";
import ipc from "electron-promise-ipc";

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

export const registerAppIpc = (): void => {
  ipc.on("app.openFolderDialog", openFolderDialog);
};
