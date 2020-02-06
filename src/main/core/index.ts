import { MainWindow } from "./MainWindow";
import { AppController } from "./AppController";
import { Database } from "../database";
import { AriaController } from "./AriaController";
import logger from "@/shared/logger";

process.on("uncaughtException", function(e) {
  logger.error("Process Error", e);
  process.exit();
});

export const db: Database = new Database();
export const ariaController: AriaController = new AriaController();
export const mainWindow: MainWindow = new MainWindow();
export const appController: AppController = new AppController();
