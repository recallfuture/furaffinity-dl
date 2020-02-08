import Vue from "vue";
import App from "./App.vue";
import "./plugins/element";
import i18n from "./plugins/i18n";

import logger from "@/backup/shared/logger";

Vue.config.productionTip = false;
Vue.config.errorHandler = error => {
  logger.error("Vue error", error);
};

new Vue({
  i18n,
  render: h => h(App)
}).$mount("#app");