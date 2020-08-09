import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

let win: BrowserWindow | null = null;

const options: BrowserWindowConstructorOptions = {
  width: 1024,
  height: 768,
  minWidth: 800,
  minHeight: 600,
  show: false,
  backgroundColor: "#121212",
  webPreferences: {
    nodeIntegration: true,
  },
};

export const createWindow = async (): Promise<void> => {
  // Create the browser window.
  win = new BrowserWindow(options);

  win.once("ready-to-show", () => win?.show());

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
};
