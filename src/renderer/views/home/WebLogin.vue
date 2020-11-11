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
import { getCookies } from "@/renderer/api";
import { defineComponent, onMounted, ref } from "@vue/composition-api";
import { getUserByCookies } from "./getUserByCookies";

// 获取登录地址
const getLoginUrl = () => {
  return "https://www.furaffinity.net/login/?r=" + Math.random();
};

// 从所有 cookie 中取出 a 和 b 的值
const getCookieAB = async () => {
  let a, b;
  const cookies = await getCookies();

  cookies.forEach(cookie => {
    if (cookie.name === "a") {
      a = cookie.value;
    } else if (cookie.name === "b") {
      b = cookie.value;
    }
  });

  return a && b ? { a, b } : null;
};

export default defineComponent({
  name: "WebLogin",
  setup: (_, ctx) => {
    const dialog = ref(false);

    const loginUrl = ref(getLoginUrl());
    const refresh = () => {
      loginUrl.value = getLoginUrl();
    };

    let timer: NodeJS.Timeout | null = null;
    let loginSuccess = false;

    onMounted(async () => {
      // 设置计时器每秒获取一次用户信息
      timer = setInterval(async () => {
        if (loginSuccess || !dialog.value) return;

        const cookies = await getCookieAB();
        if (!cookies) return;

        const user = await getUserByCookies(cookies.a, cookies.b);
        if (!user) return;

        loginSuccess = true;
        ctx.emit("success", user);
        console.log("login success", user);
      }, 1000);

      // 组建销毁时停止计时器
      return () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };
    });

    return {
      dialog,
      loginUrl,
      refresh
    };
  }
});
</script>
