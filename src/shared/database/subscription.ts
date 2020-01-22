import { find, findOne, insert, update, remove } from "./api";
import { Subscription } from "./interfaces";
import logger from "@/main/logger";

/**
 * 获取一个订阅
 * @param id 订阅作者id
 */
export async function get(id: string) {
  const query = {
    type: "Subscription",
    "data.author.id": id
  };
  const result = await findOne(query);
  logger.info("Get one subscription: ", result);
  return result;
}

/**
 * 获取所有订阅
 */
export async function getAll() {
  const query = {
    type: "Subscription",
    "data.deleted": false
  };
  const result = await find(query);
  logger.info("Get all subscription: ", result);
  return result;
}

/**
 * 添加一个订阅
 * @param id 订阅作者id
 * @param data 订阅
 */
export async function add(data: Subscription) {
  const result = await insert({ type: "Subscription", data });
  logger.info("Add subscription: ", data);
  return result;
}

/**
 * 更新一个订阅
 * @param id 订阅作者id
 * @param data 订阅
 */
export async function set(id: string, data: Subscription) {
  const query = {
    type: "Subscription",
    "data.author.id": id
  };
  const result = await update(query, data);
  logger.info("Update subscription: ", data);
  return result;
}

/**
 * 删除一个订阅
 * @param id 订阅作者id
 */
export async function del(id: string) {
  const query = {
    type: "Subscription",
    "data.author.id": id
  };
  const result = await remove(query);
  logger.info("Add subscription: ", id);
  return result;
}

export default {
  get,
  getAll,
  add,
  set,
  del
};
