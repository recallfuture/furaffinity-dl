<template lang="pug">
v-app
  //- 全局使用的组件
  guide
  add-subscription-dialog

  //- 订阅抽屉栏
  Drawer( v-model="drawer" title="订阅" :subs="subList")

  //- 订阅详情控制栏
  v-app-bar( app )
    v-app-bar-nav-icon( @click="drawer = !drawer" )
    v-toolbar-title Furaffinity-dl
    v-spacer
    user( v-model="user" )
</template>

<script>
// @ is an alias to /src
import Guide from "@/renderer/components/Guide/Guide";
import AddSubscriptionDialog from "@/renderer/components/Subscription/AddSubscriptionDialog";
import User from "@/renderer/components/Main/User";
import Drawer from "@/renderer/components/Main/Drawer";
import { faLogin } from "@/renderer/api";
import db from "@/shared/database";

export default {
  name: "home",

  data() {
    return {
      user: null,
      drawer: true,
      guide: false,
      addSub: false,

      subs: {}
    };
  },

  async mounted() {
    // 初始化用户信息
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.user = user;
      await faLogin(user.a, user.b);
    }

    // 初始化订阅信息
    const result = await db.subscription.getAll();
    for (const sub of result) {
      // 使用作者id作为索引
      this.$set(this.subs, sub.author.id, sub);
    }
  },

  computed: {
    subList() {
      return Object.values(this.subs);
    }
  },

  components: {
    Guide,
    AddSubscriptionDialog,
    User,
    Drawer
  },

  watch: {
    user(value) {
      // 用户信息更新就写入本地存储
      if (value) {
        localStorage.setItem("user", JSON.stringify(value));
      }
    }
  }
};
</script>
