import { faLogin } from "../../api";

const state = {
  guideDialog: false,
  addSubscriptionDialog: false,
  drawer: true,
  user: {}
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
    localStorage.setItem("user", JSON.stringify(user));
  },

  TOGGLE_GUIDE_DIALOG(state, status) {
    state.guideDialog = !!status;
  },

  TOGGLE_ADD_SUBSCRIPTION_DIALOG(state, status) {
    state.addSubscriptionDialog = !!status;
  },

  TOGGLE_DRAWER(state, status) {
    state.drawer = !!status;
  }
};

const actions = {
  async init({ commit }) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      commit("SET_USER", user);
      await faLogin(user.a, user.b);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
