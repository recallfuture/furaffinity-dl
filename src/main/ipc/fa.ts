import { session } from "electron";
import ipc from "electron-promise-ipc";
import {
  Author,
  Gallery,
  Login,
  MyWatchingList,
  Scraps,
  Submission,
  User
} from "furaffinity-api";
import { transformSubs } from "../../shared/utils";
import { fetch } from "../core";

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
  ipc.on("fa.clearCookies", onFaClearCookies as any);
  ipc.on("fa.getCookies", onFaGetCookies as any);

  // fa api
  ipc.on("fa.login", Login as any);
  ipc.on("fa.user", User as any);
  ipc.on("fa.watchingList", MyWatchingList as any);
  ipc.on("fa.author", Author as any);
  ipc.on("fa.gallery", Gallery as any);
  ipc.on("fa.scraps", Scraps as any);
  ipc.on("fa.submission", Submission as any);

  ipc.on("fa.fetchStart", (subs: any, fastMode: any) =>
    fetch.start(transformSubs(subs), fastMode)
  );
  ipc.on("fa.fetchStop", () => fetch.stop());
  ipc.on("fa.getGlobalStat", () => fetch.globalStat);
}
