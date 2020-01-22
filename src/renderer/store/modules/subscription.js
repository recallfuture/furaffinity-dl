import db from "@/shared/database";

const state = {
  subscriptions: []
};

const mutations = {
  ADD_SUBSCRIPTION(state, subscription) {
    state.subscriptions.push(subscription);
  }
};

const actions = {
  async init({ commit }) {
    const subscriptions = await db.subscription.getAll();
    for (const sub of subscriptions) {
      commit("ADD_SUBSCRIPTION", sub);
    }
  },

  async add({ commit }, subscription) {
    // 先看看库里是否已经存在此订阅
    const sub = await db.subscription.get(subscription.author.id);
    // 存在且没被软删除就跳出
    if (sub && !sub.deleted) {
      return;
    }

    if (sub && sub.deleted) {
      // 如果是被删掉的，就还原回来
      subscription.galleryTasks = sub.galleryTasks;
      subscription.scrapsTasks = sub.scrapsTasks;
      await db.subscription.set(subscription.author.id, subscription);
    } else {
      await db.subscription.add(subscription);
    }

    // 添加
    console.log(subscription);
    commit("ADD_SUBSCRIPTION", subscription);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
