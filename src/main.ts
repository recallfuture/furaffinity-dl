import Vue from "vue";
import App from "@/renderer/App.vue";
import store from "@/renderer/store";
import vuetify from "@/renderer/plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
import db from "@/shared/database";

// vue2 animate
import "vue2-animate/dist/vue2-animate.min.css";

Vue.config.productionTip = false;

async function start() {
  try {
    await db.initDatabase();
    await store.dispatch("app/init");
    await store.dispatch("config/init");
    await store.dispatch("subscription/init");
  } catch (e) {
    alert(e);
  }

  // @ts-ignore
  new Vue({
    store,
    // @ts-ignore
    vuetify,
    render: h => h(App)
  }).$mount("#app");
}

start();
