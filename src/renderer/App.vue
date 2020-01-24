<template lang="pug">
  v-app( v-if="!loading" )
    //- 错误提示
    v-snackbar( v-model="alert" top :color="alertType" )
      span {{ alertMessage }}
      v-btn( @click="alert = false" icon )
        v-icon mdi-close

    //- 全局使用的组件
    guide(
      v-model="guide"
      :config="config"
      :user="user"
      @user:login="login"
      @config:update="updateConfig"
    )
    add-sub-dialog( v-model="addSubDialog" :config="config" :subs="subs" @subs:new="addSubs" )

    //- 订阅抽屉栏
    Drawer( v-model="drawer" title="订阅" :subs="subList" @addSub:open="addSubDialog = true" @sub:select="selectSub" )

    //- 订阅详情控制栏
    v-app-bar( app )
      v-app-bar-nav-icon( @click="drawer = !drawer" )
      v-toolbar-title Furaffinity-dl
      v-spacer
      user( :user="user" )
    
    v-content(  )
      Detail( v-if="subSelected in subList" :sub="subList[subSelected]" )
      h2( v-else ) 未选中订阅
          
      
</template>

<script>
// @ is an alias to /src
import { faLogin } from "@/renderer/api";
import db from "@/shared/database";
import bus from "./utils/EventBus";
import cache from "./utils/Cache";
import logger from "@/shared/logger";

// 组件
import Guide from "@/renderer/components/Guide/Guide";
import AddSubDialog from "@/renderer/components/Subscription/AddSubDialog";
import User from "@/renderer/components/Main/User";
import Drawer from "@/renderer/components/Main/Drawer";
import Detail from "@/renderer/components/Main/Detail";

export default {
  name: "App",

  data() {
    return {
      loading: true,

      alert: false,
      alertType: "info",
      alertMessage: "",

      drawer: true,
      guide: false,
      addSubDialog: false,

      user: null,
      subs: {},
      subSelected: -1,
      config: {}
    };
  },

  async mounted() {
    // 初始化数据库
    await db.initDatabase();

    // 初始化用户信息
    const user = cache.get("user");
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

    // 初始化向导
    const firstTime = cache.get("first_time");
    if (firstTime === null) {
      // 一秒后弹出向导对话框
      setTimeout(() => (this.guide = true), 1000);
    }

    // 全局事件绑定
    bus.$on("snackbar", this.showSnackBar);
    bus.$on("login", this.login);

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
    Drawer,
    Detail
  },

  methods: {
    showSnackBar({ type = "info", message = "" }) {
      this.alert = true;
      this.alertType = type;
      this.alertMessage = message;
    },

    async addSubs(subs) {
      for (const sub of subs) {
        if (sub.author.id in this.subs) {
          continue;
        }

        this.$set(this.subs, sub.author.id, sub);
        await db.subscription.add(sub);
      }
    },

    selectSub(value) {
      this.subSelected = value;
    },

    login(user) {
      this.user = user;
      cache.set("user", user);
    },

    updateConfig(config) {
      // TODO: 更新设置
    }
  }
};
</script>
