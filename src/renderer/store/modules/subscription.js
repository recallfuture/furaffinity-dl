const state = {
  subscriptions: []
};

const mutations = {
  ADD_SUBSCRIPTION(state, subscription) {
    state.subscriptions.push(subscription);
  }
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
