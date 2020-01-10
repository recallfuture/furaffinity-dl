import Vue from "vue";
import App from "./main/App.vue";
import router from "./main/router";
import store from "./main/store";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
