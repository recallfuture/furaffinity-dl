<template lang="pug">
  div
    el-button( @click="reload" class="refresh-button" icon="el-icon-refresh" ) {{ $t("generic.refresh") }}
    iframe( :src="src" width="100%" height="500" )
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { clearCookies, getCookies, faLogin, faUser } from "@/renderer/api";
import { User } from "@/shared/interface";
import logger from "@/shared/logger";

@Component
export default class LoginForm extends Vue {
  timer: NodeJS.Timeout | null = null;
  success: boolean = false;
  src: string = this.getLoginUrl();

  async mounted() {
    await clearCookies();
    this.doCheck();
  }

  beforeDestroy() {
    this.endCheck();
  }

  getLoginUrl() {
    return (
      "https://www.furaffinity.net/login/?mode=imagecaptcha&r=" + Math.random()
    );
  }

  reload() {
    this.src = this.getLoginUrl();
  }

  async checkLogin() {
    let a, b;
    const cookies = await getCookies();
    logger.log(cookies);

    cookies.forEach((cookie, index) => {
      if (cookie.name === "a") {
        a = cookie.value;
      } else if (cookie.name === "b") {
        b = cookie.value;
      }
    });

    if (a && b) {
      await faLogin(a, b);
      let ret = await faUser();
      if (!ret) {
        return;
      }

      const { id, name, url, avatar } = ret;
      const user: User = { id, name, url, avatar, a, b };
      logger.log(user);

      this.success = true;
      this.$emit("success", user);
    }
  }

  doCheck() {
    this.timer = setTimeout(async () => {
      await this.checkLogin();
      if (!this.success) {
        this.doCheck();
      }
    }, 1000);
  }

  endCheck() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
</script>

<style scoped>
.refresh-button {
  width: 100%;
  color: rgba(256, 256, 256, 0.87);
  background-color: #444;
  border-color: transparent;
}

.refresh-button:hover {
  color: rgba(256, 256, 256, 0.87);
  background-color: #555;
}
</style>
