import { MainWindow } from "./MainWindow";
import { App } from "./App";
import { Database } from "../database";

export const db: Database = new Database();
export const mainWindow: MainWindow = new MainWindow();
export const app: App = new App();
