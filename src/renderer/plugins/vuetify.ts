import Vue from "vue";
// @ts-ignore
import Vuetify from "vuetify/lib";
import zhHans from "vuetify/src/locale/zh-Hans";

// @ts-ignore
import { preset } from "vue-cli-plugin-vuetify-preset-rally/preset";

Vue.use(Vuetify);

export default new Vuetify({
  preset,
  lang: {
    locales: { zhHans },
    current: "zh-Hans"
  }
});
