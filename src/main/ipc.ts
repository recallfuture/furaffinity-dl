import ipc from "electron-promise-ipc";
import { session } from "electron";
import { User } from "furaffinity-api";

export function registerMainIpc() {
  ipc.on("main.beforeLogin", () => {
    // clear cookies
    session.defaultSession?.cookies.remove(".furaffinity.net", "a");
    session.defaultSession?.cookies.remove(".furaffinity.net", "b");
  });

  ipc.on("main.login", () => {
    return session.defaultSession?.cookies.get({
      url: ".furaffinity.net"
    });
  });

  ipc.on("main.user", () => {
    return User();
  });
}
