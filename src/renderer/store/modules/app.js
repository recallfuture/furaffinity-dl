const state = {
  guideDialog: false,
  addSubscriptionDialog: false
};

const mutations = {
  TOGGLE_GUIDE_DIALOG(state, status) {
    if (status) {
      state.guideDialog = true;
    } else {
      state.guideDialog = false;
    }
  },

  TOGGLE_ADD_SUBSCRIPTION_DIALOG(state, status) {
    if (status) {
      state.addSubscriptionDialog = true;
    } else {
      state.addSubscriptionDialog = false;
    }
  }
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
