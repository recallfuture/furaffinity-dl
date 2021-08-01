<template>
  <a-config-provider :locale="locale">
    <router-view />
  </a-config-provider>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";

export default defineComponent({
  setup() {
    return {
      locale: ref(zhCN),
    };
  },
});
</script>

<style>
#app {
  font-family: "lucida grande", "lucida sans unicode", lucida, helvetica,
    "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
