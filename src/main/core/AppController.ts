"use strict";

import { app, protocol, Event } from "electron";
import is from "electron-is";
import { EventEmitter } from "events";
import { mainWindow } from ".";
import { db } from "./index";

export class AppController extends EventEmitter {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.requestSingleInstanceLock();
    this.registerScheme();
    this.registerProcessQuit();

    app.on("second-instance", this.onSecondInstance);
    app.on("window-all-closed", this.onWindowAllClosed);
    app.on("activate", this.onActivate);
    app.on("ready", this.onReady);
  }

  /**
   * 请求单例锁
   */
  requestSingleInstanceLock() {
    if (!app.requestSingleInstanceLock()) {
      app.quit();
    }
  }

  /**
   * 注册协议
   */
  registerScheme() {
    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([
      { scheme: "app", privileges: { secure: true, standard: true } }
    ]);
  }

  registerProcessQuit() {
    // 开发模式下通过控制台优雅退出
    if (is.dev()) {
      if (is.windows()) {
        process.on("message", data => {
          if (data === "graceful-exit") {
            app.quit();
          }
        });
      } else {
        process.on("SIGTERM", () => {
          app.quit();
        });
      }
    }
  }

  /**
   * 打开第二个实例时的回调
   * @param event 事件
   * @param commandLine 命令行
   * @param workingDir 工作目录
   */
  onSecondInstance(event: Event, commandLine: string[], workingDir: string) {
    if (mainWindow.win) {
      if (mainWindow.win.isMinimized()) mainWindow.win.restore();
      mainWindow.win.focus();
    }
  }

  /**
   * 窗口全部关闭后的回调
   */
  onWindowAllClosed() {
    // 在 macOS 上，除非用户明确的按 Cmd + Q，否则不关闭程序
    if (!is.macOS()) {
      app.quit();
    }
  }

  onActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow.win === null) {
      mainWindow.create();
    }
  }

  async onReady() {
    await db.create();
    mainWindow.create();
  }
}
