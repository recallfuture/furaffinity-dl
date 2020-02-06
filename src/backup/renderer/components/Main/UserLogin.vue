<template lang="pug">
  v-dialog( v-model="model" width="800" )
    v-card( color="white" )
      //- 隐藏登录框同时销毁组件
      login( v-if="model" @success="success" )
</template>

<script>
import Login from "../Form/Login";
import bus from "@/renderer/utils/EventBus";
import { clearCookies, getCookies, faLogin, faUser } from "@/renderer/api";
import logger from "@/shared/logger";

export default {
  name: "UserLogin",

  model: {
    prop: "dialog",
    event: "change"
  },

  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  },

  components: {
    Login
  },

  data() {
    return {
      model: this.dialog
    };
  },

  watch: {
    model(value) {
      this.$emit("change", value);
    },

    dialog(value) {
      this.model = value;
    }
  },

  methods: {
    success(user) {
      bus.$emit("login", user);
      this.model = false;
    }
  }
};
</script>
