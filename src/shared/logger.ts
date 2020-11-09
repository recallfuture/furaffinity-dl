import logger from "electron-log";
import is from "electron-is";
import path from "path";
import { getDataPath } from "./utils";

logger.transports.console.level = is.production() ? "warn" : "silly";
logger.transports.file.level = is.production() ? "warn" : "silly";

logger.transports.file.resolvePath = () => path.join(getDataPath(), "logs");

export default logger;
