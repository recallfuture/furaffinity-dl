<template lang="pug">
  //- 用户信息不为空就展示出来
  div( v-if="user" )
    v-avatar( size="36" class="mr-2" )
      img( :src="user.avatar" )
    span( class="mr-2" ) {{ user.name }}

  //- 为空就显示登录按钮
  div( v-else )
    v-btn( @click="dialog = true" text ) 登录
    v-dialog( v-model="dialog" width="800" )
      v-card( color="white" )
        //- 隐藏登录框同时销毁组件
        login( v-if="dialog" @success="loginSuccess" )
</template>

<script>
import Login from "../Login/Login";
import bus from "@/renderer/utils/EventBus";

export default {
  name: "User",

  props: {
    user: {
      type: Object,
      default: null
    }
  },

  components: {
    Login
  },

  data() {
    return {
      dialog: false
    };
  },

  methods: {
    loginSuccess(user) {
      bus.$emit("login", user);
      this.dialog = false;
    }
  }
};
</script>
