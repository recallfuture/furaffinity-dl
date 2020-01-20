import Vue from "vue";
import App from "./renderer/App.vue";
import router from "./renderer/router";
import store from "./renderer/store";

// vue2 animate
require("vue2-animate/dist/vue2-animate.min.css");

// font awesome
require("@fortawesome/fontawesome-free/css/all.css");

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
