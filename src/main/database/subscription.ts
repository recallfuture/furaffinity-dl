import { find, findOne, insert, update, remove } from "./api";
import { Subscription } from "./interfaces";

/**
 * 获取一个订阅
 * @param id 订阅作者id
 */
export async function get(id: string) {
  const query = {
    type: "Subscription",
    "data.author.id": id
  };
  const result: any = await findOne(query);
  return result?.data as Subscription;
}

/**
 * 获取所有订阅
 */
export async function getAll() {
  const query = {
    type: "Subscription",
    "data.deleted": false
  };
  const result: any[] | undefined = await find(query);
  // FIX: 修复层级过深的对象解析时间过长的问题
  return result?.map(value => {
    return value.data;
  }) as Subscription[];
}

/**
 * 添加一个订阅
 * @param id 订阅作者id
 * @param data 订阅
 */
export async function add(data: Subscription) {
  const result = await insert({ type: "Subscription", data });
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
  const result = await update(query, { type: "Subscription", data });
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
  return result;
}

export default {
  get,
  getAll,
  add,
  set,
  del
};
