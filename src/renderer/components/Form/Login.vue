<template lang="pug">
div
  v-btn( @click="reload" block )
    span 点我回到验证码登录页
  iframe( :src="src" width="100%" height="500" )
</template>

<script>
import { clearCookies, getCookies, faLogin, faUser } from "@/renderer/api";
import logger from "@/shared/logger";

export default {
  name: "Login",

  data() {
    return {
      timer: null,
      success: false,
      src: this.getLoginUrl()
    };
  },

  async mounted() {
    await clearCookies();
    this.doCheck();
  },

  beforeDestroy() {
    this.endCheck();
  },

  methods: {
    getLoginUrl() {
      return (
        "https://www.furaffinity.net/login/?mode=imagecaptcha&r=" +
        Math.random()
      );
    },

    reload() {
      this.src = this.getLoginUrl();
    },

    async checkLogin() {
      let a, b;
      const cookies = await getCookies();

      cookies.forEach((cookie, index) => {
        if (cookie.name === "a") {
          a = cookie.value;
        } else if (cookie.name === "b") {
          b = cookie.value;
        }
      });

      if (a && b) {
        await faLogin(a, b);
        const user = await faUser();
        if (!user) {
          return;
        }

        user.a = a;
        user.b = b;
        logger.log(user);

        this.success = true;
        this.$emit("success", user);
      }
    },

    doCheck() {
      this.timer = setTimeout(async () => {
        await this.checkLogin();
        if (!this.success) {
          this.doCheck();
        }
      }, 1000);
    },

    endCheck() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }
};
</script>
