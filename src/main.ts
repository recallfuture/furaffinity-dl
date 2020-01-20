import Vue from "vue";
import App from "./renderer/App.vue";
import router from "./renderer/router";
import store from "./renderer/store";
import vuetify from "./renderer/plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";

// vue2 animate
import "vue2-animate/dist/vue2-animate.min.css";

Vue.config.productionTip = false;

// @ts-ignore
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
