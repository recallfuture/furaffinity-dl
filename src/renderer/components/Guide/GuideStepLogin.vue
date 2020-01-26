<template lang="pug">
div
  v-stepper-step( :complete="complete" :step="step" :editable="editable" )
    div( v-if="user" )
      user(  :user="user" )
    span( v-else ) 登录
  
  v-stepper-content( :step="step" )
    p 请在下方登录，或者
      v-btn( @click="$emit('next')" text ) 跳过
    
    //- 惰性加载，减少 ipc 请求数
    login( v-if="!complete" @success="loginSuccess" )
</template>

<script>
import { mapState } from "vuex";
import Login from "../Form/Login";
import User from "../Main/User";
import bus from "@/renderer/utils/EventBus";

export default {
  name: "GuideStepLogin",

  data() {
    return {
      title: "登录",
      editable: true
    };
  },

  mounted() {
    if (this.user) {
      this.editable = false;
      this.$emit("next");
    }
  },

  props: {
    complete: {
      type: Boolean,
      required: true
    },

    step: {
      type: String,
      required: true
    },

    user: {
      type: Object,
      default: null
    }
  },

  components: {
    Login,
    User
  },

  methods: {
    async loginSuccess(user) {
      this.editable = false;
      this.$emit("next");
      bus.$emit("login", user);
    }
  }
};
</script>
