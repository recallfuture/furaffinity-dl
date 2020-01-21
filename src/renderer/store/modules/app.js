const state = {
  guideDialog: false
};

const mutations = {
  TOGGLE_GUIDE_DIALOG(state, status) {
    if (status) {
      state.guideDialog = true;
    } else {
      state.guideDialog = false;
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
