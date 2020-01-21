import db from "@/shared/database";

const state = {
  ariaConfig: {},
  userConfig: {}
};

const mutations = {
  UPDATE_ARIA_CONFIG(state, config) {
    state.ariaConfig = { ...state.ariaConfig, ...config };
  },

  UPDATE_USER_CONFIG(state, config) {
    state.userConfig = { ...state.userConfig, ...config };
  }
};

const actions = {
  async init({ commit }) {
    commit("UPDATE_ARIA_CONFIG", await db.ariaConfig.get());
    commit("UPDATE_USER_CONFIG", await db.userConfig.get());
  },

  async saveAriaConfig({ state, commit }, config) {
    commit("UPDATE_ARIA_CONFIG", config);
    await db.ariaConfig.set(state.ariaConfig);
  },

  async saveUserConfig({ state, commit }, config) {
    commit("UPDATE_USER_CONFIG", config);
    await db.userConfig.set(state.userConfig);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
