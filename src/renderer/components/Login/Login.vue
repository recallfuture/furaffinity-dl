<template lang="pug">
v-container( fluid )
  v-btn( @click="reload" block )
    v-icon mdi-reload
  iframe( :src="src" width="100%" height="500" )
</template>

<script>
import { clearCookies, getCookies } from "@/renderer/api";

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
      console.log(cookies);

      cookies.forEach((cookie, index) => {
        if (cookie.name === "a") {
          a = cookie.value;
        } else if (cookie.name === "b") {
          b = cookie.value;
        }
      });

      if (a && b) {
        this.success = true;
        this.$emit("success", { a, b });
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
