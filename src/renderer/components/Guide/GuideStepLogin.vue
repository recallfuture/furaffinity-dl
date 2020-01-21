<template lang="pug">
div
  v-stepper-step( :complete="complete" :step="step" :editable="editable" )
    span( v-if="user && user.name" ) {{  user.name }} 已登录
    span( v-else ) 登录
  
  v-stepper-content( :step="step" )
    p 请在下方登录，或者
      v-btn( @click="$emit('next')" text ) 跳过
    
    //- 惰性加载，减少 ipc 请求数
    login( v-if="!complete" @success="loginSuccess" )
</template>

<script>
import Login from "../Login/Login";
import { faLogin, faUser } from "@/renderer/api/index";

export default {
  name: "GuideStepLogin",

  data() {
    return {
      title: "登录",
      user: null,
      editable: true
    };
  },

  props: {
    complete: {
      type: Boolean,
      required: true
    },
    step: {
      type: String,
      required: true
    }
  },

  components: {
    Login
  },

  methods: {
    async loginSuccess({ a, b }) {
      await faLogin(a, b);
      const user = await faUser();
      console.log(user);

      this.user = user;
      this.editable = false;
      this.$emit("success", { user, a, b });
    }
  }
};
</script>
