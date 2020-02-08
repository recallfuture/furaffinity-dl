import Datastore from "nedb-promises";
import path from "path";
import { getPath } from "@/backup/shared/utils";

export const dbPath: string = path.join(getPath("userData"), "database.db");

let db: Datastore | null = null;

/**
 * 初始化数据库
 */
export async function initDatabase(path: string) {
  db = Datastore.create({
    filename: path
  });
  await db.load();
  // 设定数据库每隔30秒自动压缩
  // @ts-ignore
  // await db.persistence.setAutocompactionInterval(30000);
}

/**
 * 清空数据库
 */
export async function clearDatabase() {
  db?.remove({}, { multi: true });
}

/**
 * 根据查询条件寻找一个匹配数据
 * @param query 查询条件
 */
export async function findOne(query: any) {
  return await db?.findOne(query);
}

/**
 * 根据查询条件寻找所有匹配数据
 * @param query 查询条件
 */
export async function find(query: any) {
  return await db?.find(query);
}

/**
 * 插入一条数据
 */
export async function insert(doc: any) {
  return await db?.insert(doc);
}

/**
 * 更新数据
 * @param query 查询条件
 * @param doc 数据
 */
export async function update(query: any, doc: any) {
  await db?.update(query, doc);
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

/**
 * 删除数据
 * @param query 查询条件
 * @param multi 是否允许删除所有匹配
 */
export async function remove(query: any, multi: boolean = false) {
  return await db?.remove(query, { multi });
}