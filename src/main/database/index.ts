import { app } from "electron";
import Datastore from "nedb-promises";
import path from "path";
import logger from "../logger";
import ariaConfig from "./ariaConfig";
import userConfig from "./userConfig";

const dbPath: string = app.getPath("userData");

let db: Datastore | null = null;

/**
 * 初始化数据库
 */
export async function initDatabase() {
  db = Datastore.create({
    filename: path.join(dbPath, "database.db")
  });
  await db.load();
  logger.info("Database init");
}

/**
 * 根据查询条件寻找一个匹配数据
 * @param query 查询条件
 */
export async function findOne(query: any) {
  return await db?.findOne(query);
}

/**
 * 添加或更新数据
 * @param query 查询条件
 * @param doc 数据
 */
export async function updateOrAdd(query: any, doc: any) {
  if (await db?.findOne(query)) {
    await db?.update(query, doc);
  } else {
    await db?.insert(doc);
  }
}

export default {
  initDatabase,
  findOne,
  updateOrAdd,
  ariaConfig,
  userConfig
};
