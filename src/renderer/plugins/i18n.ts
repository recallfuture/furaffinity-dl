import Vue from "vue";
import VueI18n from "vue-i18n";

const enLocale = require("element-ui/lib/locale/lang/en");
const zhLocale = require("element-ui/lib/locale/lang/zh-CN");

Vue.use(VueI18n);

const messages = {
  en: {
    ...require("../locales/en"),
    ...enLocale
  },
  zh: {
    ...require("../locales/zh-CN"),
    ...zhLocale
  }
};

const i18n = new VueI18n({
  locale: "zh",
  fallbackLocale: "en",
  messages
});

export default i18n;
