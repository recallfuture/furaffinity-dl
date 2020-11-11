import { MainWindow } from "./MainWindow";
import { AppController } from "./AppController";
import logger from "@/main/utils/logger";

process.on("uncaughtException", function(e) {
  logger.error("Process Error", e);
});

export const mainWindow: MainWindow = new MainWindow();
export const appController: AppController = new AppController();
