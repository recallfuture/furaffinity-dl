import { session, ipcMain } from "electron";
import {
  Author,
  Gallery,
  Login,
  MyWatchingList,
  Scraps,
  Submission,
  User,
} from "furaffinity-api";

export const getCookies = (): Promise<Electron.Cookie[]> =>
  session.defaultSession?.cookies.get({
    domain: ".furaffinity.net",
  });

export const clearCookies = async (): Promise<void> => {
  await session.defaultSession?.cookies.remove(
    "http://www.furaffinity.net",
    "a"
  );
  await session.defaultSession?.cookies.remove(
    "http://www.furaffinity.net",
    "b"
  );
};

const warp = (fn: Function) => (_: any, ...args: any[]) => fn(...args);

export const registerFaIpc = (): void => {
  // fa api
  ipcMain.on("fa.getCookies", warp(getCookies));
  ipcMain.on("fa.clearCookies", warp(clearCookies));
  ipcMain.on("fa.login", warp(Login));
  ipcMain.on("fa.user", warp(User));
  ipcMain.on("fa.watchingList", warp(MyWatchingList));
  ipcMain.on("fa.author", warp(Author));
  ipcMain.on("fa.gallery", warp(Gallery));
  ipcMain.on("fa.scraps", warp(Scraps));
  ipcMain.on("fa.submission", warp(Submission));
};
