import Vue from "vue";
import App from "./App.vue";

import logger from "@/backup/shared/logger";

Vue.config.productionTip = false;
Vue.config.errorHandler = error => {
  logger.error("Vue error", error);
};

new Vue({
  render: h => h(App)
}).$mount("#app");
