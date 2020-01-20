import ipc from "electron-promise-ipc";
import { session } from "electron";
import {
  User,
  WatchingList,
  Author,
  Gallery,
  Scraps,
  Submission
} from "furaffinity-api";

async function onFaClearCookies() {
  await session.defaultSession?.cookies.remove(
    "http://www.furaffinity.net",
    "a"
  );
  await session.defaultSession?.cookies.remove(
    "http://www.furaffinity.net",
    "b"
  );
}

async function onFaGetCookies() {
  return session.defaultSession?.cookies.get({
    domain: ".furaffinity.net"
  });
}

export function registerFaIpc() {
  // cookies
  ipc.on("fa.clearCookies", onFaClearCookies);
  ipc.on("fa.getCookies", onFaGetCookies);

  // fa api
  ipc.on("fa.user", User);
  ipc.on("fa.watchingList", (id: any) => WatchingList(id));
  ipc.on("fa.author", (id: any) => Author(id));
  ipc.on("fa.gallery", (id: any, page: any) => Gallery(id, page));
  ipc.on("fa.scraps", (id: any, page: any) => Scraps(id, page));
  ipc.on("fa.submission", (id: any) => Submission(id));
}
