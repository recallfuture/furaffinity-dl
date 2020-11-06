import { BrowserWindow, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

// 去掉顶部的窗口菜单
Menu.setApplicationMenu(null);

// 窗口创建参数
const options: Electron.BrowserWindowConstructorOptions = {
  width: 1024,
  height: 768,
  minWidth: 800,
  minHeight: 600,
  show: false,
  backgroundColor: "#222",
  webPreferences: {
    nodeIntegration: true
  }
};

/**
 * 主窗口类
 */
export class MainWindow {
  win: BrowserWindow | null = null;

  create() {
    this.win = new BrowserWindow(options);
    this.win.on("close", () => this.close());
    this.win.once("ready-to-show", () => this.readyToShow());
    this.win.webContents.session.webRequest.onBeforeRequest(
      async ({ url }, callback) => {
        const recaptchaUrl = "https://www.google.com/recaptcha";
        callback(
          url.startsWith(recaptchaUrl)
            ? {
              redirectURL: url.replace(
                recaptchaUrl,
                "https://recaptcha.net/recaptcha"
              )
            }
            : {}
        );
      }
    );
    this.load();
  }

  close() {
    this.win = null;
  }

  readyToShow() {
    this.win?.show();
    this.win?.maximize();
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
