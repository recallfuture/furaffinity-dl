import db from "@/shared/database";

const state = {
  userConfig: {},
  ariaConfig: {}
};

const mutations = {
  SET_USER_CONFIG(state, config) {
    state.userConfig = config;
  },

  SET_ARIA_CONFIG(state, config) {
    state.ariaConfig = config;
  }
};

const actions = {
  async initConfig(context) {
    context.commit("SET_USER_CONFIG", await db.userConfig.get());
    context.commit("SET_ARIA_CONFIG", await db.ariaConfig.get());
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
