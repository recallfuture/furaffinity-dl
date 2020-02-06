import { BrowserWindow, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { EventEmitter } from "events";

// 去掉顶部的窗口菜单
Menu.setApplicationMenu(null);

// 窗口创建参数
const options = {
  width: 1024,
  height: 768,
  minWidth: 800,
  minHeight: 600,
  show: false,
  // backgroundColor: "#33333D",
  webPreferences: {
    nodeIntegration: true
  }
};

/**
 * 主窗口
 */
export class MainWindow extends EventEmitter {
  win: BrowserWindow | null = null;

  create() {
    this.win = new BrowserWindow(options);
    this.load();
    this.win.on("close", this.close);
  }

  close() {
    this.win = null;
  }

  load() {
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      this.win?.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
      if (!process.env.IS_TEST) this.win?.webContents.openDevTools();
    } else {
      createProtocol("app");
      // Load the index.html when not in development
      this.win?.loadURL("app://./index.html");
    }
  }
}
