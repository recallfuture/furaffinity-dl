import { find, findOne, insert, update, remove } from "./api";
import { Subscription } from "./interfaces";

/**
 * 获取一个订阅
 * @param id 订阅作者id
 */
export async function get(id: string) {
  const query = {
    type: "subscription",
    "data.author.id": id
  };
  return await findOne(query);
}

/**
 * 获取所有订阅
 */
export async function getAll() {
  return await find({ type: "subscription", "data.deleted": false });
}

/**
 * 添加一个订阅
 * @param id 订阅作者id
 * @param data 订阅
 */
export async function add(id: string, data: Subscription) {
  const query = {
    type: "subscription",
    "data.author.id": id
  };
  if (await find(query)) {
    return;
  }
  return await insert({ type: "subscription", data });
}

/**
 * 更新一个订阅
 * @param id 订阅作者id
 * @param data 订阅
 */
export async function set(id: string, data: Subscription) {
  const query = {
    type: "subscription",
    "data.author.id": id
  };
  if (await find(query)) {
    return await update(query, data);
  }
}

/**
 * 删除一个订阅
 * @param id 订阅作者id
 */
export async function del(id: string) {
  const query = {
    type: "subscription",
    "data.author.id": id
  };
  if (await find(query)) {
    return await remove(query);
  }
}

export default {
  get,
  getAll,
  add,
  set,
  del
};
