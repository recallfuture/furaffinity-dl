import Vue from "vue";
import Vuetify from "vuetify/lib";
import zhHans from "vuetify/src/locale/zh-Hans";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true
  },
  lang: {
    locales: { zhHans },
    current: "zh-Hans"
  }
});
