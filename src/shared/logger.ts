import logger from "electron-log";
import is from "electron-is";

logger.transports.console.level = is.production() ? "warn" : "silly";
logger.transports.file.level = is.production() ? "debug" : false;

export default logger;
