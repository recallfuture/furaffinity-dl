import { app } from "electron";
import Datastore from "nedb-promises";
import path from "path";

const dbPath: string = app.getPath("userData");

let db: Datastore;

/**
 * 初始化数据库
 */
export async function initDatabase() {
  db = Datastore.create({
    filename: path.join(dbPath, "database.db")
  });
  await db.load();
}

/**
 * 添加或更新数据
 * @param query 查询条件
 * @param doc 数据
 */
async function updateOrAdd(query: any, doc: any) {
  if (await db.findOne(query)) {
    await db.update(query, doc);
  } else {
    await db.insert(doc);
  }
}

interface Config {
  defaultDownloadPath: string;
}

let config: Config | null;

/**
 * 获取配置默认值
 */
export function getDefaultConfig(): Config {
  return {
    defaultDownloadPath: app.getPath("pictures")
  };
}

/**
 * 获取配置
 */
export async function getConfig(): Promise<Config> {
  const doc: any = await db.findOne({ type: "config" });

  if (!doc) {
    config = getDefaultConfig();
    await setConfig(config);
  } else {
    config = { ...getDefaultConfig(), ...doc.data } as Config;
  }

  return config;
}

/**
 * 保存配置
 * @param data 配置
 */
export async function setConfig(data: Config) {
  await updateOrAdd({ type: "config" }, { type: "config", data });
}
