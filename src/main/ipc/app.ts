import { dialog } from "electron";
import ipc from "electron-promise-ipc";
import { win } from "../window";

/**
 * 打开选择文件夹的对话框
 * 返回文件夹路径
 */
async function openFolderDialog(): Promise<string[] | undefined> {
  let result;
  if (win) {
    result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"]
    });
  } else {
    result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
  }

  return result.filePaths;
}

export function registerAppIpc() {
  ipc.on("app.openFolderDialog", openFolderDialog);
}
