import { dialog, app } from "electron";
import ipc from "electron-promise-ipc";
import { mainWindow } from "../core";

/**
 * 打开选择文件夹的对话框
 * 返回文件夹路径
 */
async function openFolderDialog(): Promise<string[] | undefined> {
  if (mainWindow.win) {
    const result = await dialog.showOpenDialog(mainWindow.win, {
      properties: ["openDirectory", "multiSelections"]
    });
    return result.filePaths;
  }
}

export function registerAppIpc() {
  ipc.on("app.openFolderDialog", openFolderDialog);
}
