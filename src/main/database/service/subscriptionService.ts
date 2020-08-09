import { getManager } from "typeorm";
import { Subscription } from "../entities/Subscription";
import { taskService } from "./taskService";

/**
 * 获取一个订阅
 * @param id 订阅id
 */
async function getSub(id: string) {
  return await getManager().findOne(Subscription, id);
}

/**
 * 添加订阅
 * @param sub 订阅
 */
async function saveSub(sub: Subscription): Promise<Subscription> {
  return await getManager().save(sub);
}

/**
 * 删除订阅
 * @param id 订阅id
 */
async function removeSub(id: string) {
  await taskService.clearTasks(id);
  return await getManager().delete(Subscription, id);
}

/**
 * 获取所有的订阅
 */
async function getSubs(): Promise<Subscription[]> {
  return await getManager().find(Subscription);
}

/**
 * 批量添加订阅
 * @param subs 订阅
 */
async function saveSubs(subs: Subscription[]) {
  return await getManager().save(subs, { chunk: 500 });
}

export const subscriptionService = {
  getSub,
  saveSub,
  removeSub,
  getSubs,
  saveSubs
};
