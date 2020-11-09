<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="scale-transition"
  >
    <template v-slot:activator="activator">
      <slot v-bind="activator" />
    </template>
    <v-card>
      <v-toolbar>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>网页登录</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn icon @click="refresh">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <iframe
        :src="loginUrl"
        frameborder="no"
        border="0"
        width="100%"
        style="height: calc(100vh - 56px)"
      />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";

// 获取登录地址
const getLoginUrl = () => {
  return "https://www.furaffinity.net/login/?r=" + Math.random();
};

export default defineComponent({
  name: "WebLogin",
  setup: () => {
    const dialog = ref(false);

    const loginUrl = ref(getLoginUrl());
    const refresh = () => {
      loginUrl.value = getLoginUrl();
    };

    return {
      dialog,
      loginUrl,
      refresh
    };
  }
});
</script>
