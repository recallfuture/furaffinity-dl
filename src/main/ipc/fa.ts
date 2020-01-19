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

function onFaClearCookies() {
  session.defaultSession?.cookies.remove(".furaffinity.net", "a");
  session.defaultSession?.cookies.remove(".furaffinity.net", "b");
}

function onFaGetCookies() {
  return session.defaultSession?.cookies.get({
    url: ".furaffinity.net"
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
