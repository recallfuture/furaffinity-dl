import { session } from "electron";
import ipc from "electron-promise-ipc";
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

export const registerFaIpc = (): void => {
  // fa api
  ipc.on("fa.getCookies", getCookies);
  ipc.on("fa.clearCookies", clearCookies);
  ipc.on("fa.login", Login as never);
  ipc.on("fa.user", User as never);
  ipc.on("fa.watchingList", MyWatchingList as never);
  ipc.on("fa.author", Author as never);
  ipc.on("fa.gallery", Gallery as never);
  ipc.on("fa.scraps", Scraps as never);
  ipc.on("fa.submission", Submission as never);
};
