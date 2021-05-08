import logger from "electron-log";
import is from "electron-is";
import path from "path";
import { getDataPath } from ".";

logger.transports.console.level = is.production() ? "warn" : "silly";
logger.transports.file.level = is.production() ? "warn" : false;

logger.transports.file.resolvePath = () => path.join(getDataPath(), "logs");

export default logger;
