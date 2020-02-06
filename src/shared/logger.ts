import logger from "electron-log";
import is from "electron-is";

logger.transports.console.level = is.production() ? "warn" : "silly";

export default logger;
