import { MainWindow } from "./MainWindow";
import { AppController } from "./AppController";
import { Database } from "../database";
import { AriaController } from "./AriaController";
import { Fetch } from "./Fetch";
import logger from "@/shared/logger";

process.on("uncaughtException", function(e) {
  logger.error("Process Error", e);
});

export const db: Database = new Database();
export const ariaController: AriaController = new AriaController();
export const fetch: Fetch = new Fetch();
export const mainWindow: MainWindow = new MainWindow();
export const appController: AppController = new AppController();
