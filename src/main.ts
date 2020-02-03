import Vue from "vue";
import App from "@/renderer/App.vue";
import vuetify from "@/renderer/plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";

// vue2 animate
import "vue2-animate/dist/vue2-animate.min.css";
import logger from "@/shared/logger";

Vue.config.productionTip = false;
Vue.config.errorHandler = (error, vm) => {
  logger.error("Vue error", error, vm);
};

// @ts-ignore
new Vue({
  // @ts-ignore
  vuetify,
  render: h => h(App)
}).$mount("#app");
