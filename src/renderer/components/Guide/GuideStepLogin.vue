<template lang="pug">
div
  v-stepper-step( :complete="complete" :step="step" :editable="editable" )
    div( v-if="user && user.name" ) 
      v-avatar( size="36" class="mr-2"  )
        v-img( :src="user.avatar" )
      span {{  user.name }} 已登录
    span( v-else ) 登录
  
  v-stepper-content( :step="step" )
    p 请在下方登录，或者
      v-btn( @click="$emit('next')" text ) 跳过
    
    //- 惰性加载，减少 ipc 请求数
    login( v-if="!complete" @success="loginSuccess" )
</template>

<script>
import Login from "../Login/Login";
import { mapState } from "vuex";

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
      this.$emit("success", this.user);
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
    }
  },

  computed: {
    ...mapState("app/", {
      user: state => state.user
    })
  },

  components: {
    Login
  },

  methods: {
    async loginSuccess(user) {
      this.$store.commit("app/SET_USER", user);
      this.editable = false;
      this.$emit("success", user);
    }
  }
};
</script>
