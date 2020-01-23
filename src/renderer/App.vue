<template lang="pug">
v-app( v-if="!loading" )
  //- 错误提示
  v-snackbar( v-model="alert" top :color="alertType" )
    span {{ alertMessage }}
    v-btn( @click="alert = false" icon color="pink" )
      v-icon mdi-close

  //- 全局使用的组件
  guide
  add-sub-dialog( v-model="addSubDialog" :config="config" :subs="subs" @new:subs="newSubs" )

  //- 订阅抽屉栏
  Drawer( v-model="drawer" title="订阅" :subs="subList" @sub:add="addSubDialog = true" )

  //- 订阅详情控制栏
  v-app-bar( app )
    v-app-bar-nav-icon( @click="drawer = !drawer" )
    v-toolbar-title Furaffinity-dl
    v-spacer
    user( v-model="user" )
</template>

<script>
// @ is an alias to /src
import { faLogin } from "@/renderer/api";
import db from "@/shared/database";
import bus from "./utils/EventBus";

// 组件
import Guide from "@/renderer/components/Guide/Guide";
import AddSubDialog from "@/renderer/components/Subscription/AddSubDialog";
import User from "@/renderer/components/Main/User";
import Drawer from "@/renderer/components/Main/Drawer";

export default {
  name: "App",

  data() {
    return {
      loading: true,

      alert: false,
      alertType: "info",
      alertMessage: "",

      user: null,
      drawer: true,
      guide: false,
      addSubDialog: false,

      subs: {},
      config: {}
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

    // 初始化配置信息
    this.config = {
      ...(await db.ariaConfig.get()),
      ...(await db.userConfig.get())
    };

    bus.$on("snackbar", this.showSnackBar);

    this.loading = false;
  },

  computed: {
    subList() {
      return Object.values(this.subs);
    }
  },

  components: {
    Guide,
    AddSubDialog,
    User,
    Drawer
  },

  methods: {
    showSnackBar({ type = "info", message = "" }) {
      this.alert = true;
      this.alertType = type;
      this.alertMessage = message;
    },

    async newSubs(subs) {
      for (const sub of subs) {
        if (sub.author.id in this.subs) {
          continue;
        }

        this.$set(this.subs, sub.author.id, sub);
        await db.subscription.add(sub);
      }
    }
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
