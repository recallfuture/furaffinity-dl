import { dialog } from "electron";
import ipc from "electron-promise-ipc";
import { win } from "../window";
import { exists } from "fs";
import { promisify } from "util";

const existsAsync = promisify(exists);

/**
 * 打开选择文件夹的对话框
 * 返回文件夹路径
 */
async function openFolderDialog(): Promise<string[] | undefined> {
  let result;
  if (win) {
    result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory", "multiSelections"]
    });
  } else {
    result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
  }

  return result.filePaths;
}

async function existsPaths(paths: string[]) {
  const result: Boolean[] = [];

  for (const path of paths) {
    result.push(await existsAsync(path));
  }

  return result;
}

export function registerAppIpc() {
  ipc.on("app.openFolderDialog", openFolderDialog);
  ipc.on("app.existsPaths", (paths: any) => existsPaths(paths));
}
