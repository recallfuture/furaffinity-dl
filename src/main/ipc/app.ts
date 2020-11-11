import { dialog, session } from "electron";
import ipc from "electron-promise-ipc";
import { mainWindow } from "../core";

/**
 * 打开选择文件夹的对话框
 * 返回文件夹路径
 */
async function openFolderDialog(): Promise<string[] | undefined> {
  if (!mainWindow.win) {
    throw new Error("there is no window");
  }

  const result = await dialog.showOpenDialog(mainWindow.win, {
    properties: ["openDirectory", "multiSelections"]
  });
  return result.filePaths;
}

export const getCookies = () =>
  session.defaultSession?.cookies.get({
    domain: ".furaffinity.net"
  });

export const clearCookies = async () => {
  await session.defaultSession?.cookies.remove(
    "http://www.furaffinity.net",
    "a"
  );
  await session.defaultSession?.cookies.remove(
    "http://www.furaffinity.net",
    "b"
  );
};

export function registerAppIpc() {
  ipc.on("app.openFolderDialog", openFolderDialog);
  ipc.on("app.getCookies", getCookies);
  ipc.on("app.clearCookies", clearCookies);
}
