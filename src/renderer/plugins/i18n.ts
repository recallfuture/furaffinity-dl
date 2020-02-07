import Vue from "vue";
import VueI18n from "vue-i18n";

const enLocale = require("element-ui/lib/locale/lang/en");
const zhLocale = require("element-ui/lib/locale/lang/zh-CN");
const ElementLocale = require("element-ui/lib/locale");

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

ElementLocale.i18n((key: string, value: string) => i18n.t(key, value));

export default i18n;
