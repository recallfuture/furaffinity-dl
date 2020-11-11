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

export function registerFaIpc() {
  // fa api
  ipc.on("fa.login", Login as never);
  ipc.on("fa.user", User as never);
  ipc.on("fa.watchingList", MyWatchingList as never);
  ipc.on("fa.author", Author as never);
  ipc.on("fa.gallery", Gallery as never);
  ipc.on("fa.scraps", Scraps as never);
  ipc.on("fa.submission", Submission as never);
}
