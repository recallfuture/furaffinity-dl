<template>
  <v-layout justify-center align-center column fill-height>
    <h1>欢迎使用 Furaffinity-dl</h1>
    <p class="my-4" style="width: 600px; text-align: center;">
      本软件用于批量管理、下载用户在 fa 上已关注作者的作品。
      <br />
      在开始使用前，请先登录你的账号。
    </p>

    <div style="width: 200px;">
      <WebLogin>
        <template v-slot="{ on, attrs }">
          <v-btn class="mb-4" block v-bind="attrs" v-on="on">
            网页登录
          </v-btn>
        </template>
      </WebLogin>
      <CookieLogin>
        <template v-slot="{ on, attrs }">
          <v-btn block v-bind="attrs" v-on="on">
            cookie 登录
          </v-btn>
        </template>
      </CookieLogin>
    </div>
  </v-layout>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import WebLogin from "./WebLogin.vue";
import CookieLogin from "./CookieLogin.vue";

export default defineComponent({
  name: "Home",
  components: {
    WebLogin,
    CookieLogin
  }
});
</script>
