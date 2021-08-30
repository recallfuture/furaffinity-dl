<template>
  <NConfigProvider
    :theme="darkTheme"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme-overrides="themeOverrides"
  >
    <router-view />
  </NConfigProvider>
</template>

<script lang="ts" setup>
import {
  NConfigProvider,
  zhCN,
  dateZhCN,
  darkTheme,
  GlobalThemeOverrides,
} from "naive-ui";

const themeOverrides: GlobalThemeOverrides = {
  common: {
    baseColor: "rgba(255, 255, 255, 0.87)",
    // https://mdcui.com/material-design/style/color.html#color-color-palette
    primaryColor: "#1976D2",
    primaryColorHover: "#1E88E5",
    primaryColorPressed: "#1565C0",
    primaryColorSuppl: "#1976D2",
  },
};
</script>

<style>
#app {
  color: rgba(255, 255, 255, 0.87);
  font-family: "lucida grande", "lucida sans unicode", lucida, helvetica,
    "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
