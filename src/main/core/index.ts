import { MainWindow } from "./MainWindow";
import { AppController } from "./AppController";
import { Database } from "../database";

export const db: Database = new Database();
export const mainWindow: MainWindow = new MainWindow();
export const appController: AppController = new AppController();
