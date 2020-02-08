<template lang="pug">
  el-container( v-if="!loading" style="height: 100vh;" )
    el-header
      Toolbar( :user="user" )

    el-main
      sub-table()

    el-footer
      span @Furaffinity-dl
</template>

<script lang="ts">
import { Vue, Component, Prop, ProvideReactive } from "vue-property-decorator";
import { Subscription } from "@/main/database/entity";
import logger from "@/shared/logger";
import { User } from "./interface";
import cache from "@/renderer/utils/Cache";
import { faLogin, getSubs, getAriaConfig, saveSubs } from "./api";
import bus from "@/renderer/utils/EventBus";

// 组件
import Toolbar from "./components/header/Toolbar.vue";
import SubTable from "./components/main/SubTable.vue";
import { AriaConfig } from "../main/database";

@Component({
  components: { Toolbar, SubTable }
})
export default class App extends Vue {
  @ProvideReactive() subs: Subscription[] = [];
  @ProvideReactive() ariaConfig: AriaConfig | null = null;

  loading: boolean = true;
  user: User | null = null;

  async mounted() {
    await this.initConfig();
    await this.initUser();
    await this.initSubs();
    this.initHandle();
    this.loading = false;
  }

  async initConfig() {
    this.ariaConfig = await getAriaConfig();
  }

  /**
   * 初始化用户信息
   */
  async initUser() {
    const user: User | null = cache.get("user");
    if (user) {
      this.user = user;
      await faLogin(user.a, user.b);
    }
  }

  /**
   * 初始化订阅列表
   */
  async initSubs() {
    const subs = await getSubs();
    for (const sub of subs) {
      sub.status = "";
      this.subs.push(sub);
    }
  }

  /**
   * 初始化总线事件回调
   */
  initHandle() {
    bus.$on("header.login", this.handleLogin);
    bus.$on("header.logout", this.handleLogout);
    bus.$on("sub.add", this.handleAddSub);
  }

  handleLogin(user: User) {
    this.user = user;
    cache.set("user", user);
  }

  handleLogout() {
    this.user = null;
    cache.set("user", null);
  }

  async handleAddSub(subs: Subscription[]) {
    if (subs.length > 0) {
      await saveSubs(subs);
      await this.initSubs();
      this.$message.success(this.$tc("sub.add", subs.length));
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

.el-scrollbar__wrap {
  overflow-x: hidden !important;
}

.el-header {
  background-color: #121212;
  color: rgba(256, 256, 256, 0.87);
}

.el-main {
  background-color: #222;
  color: rgba(256, 256, 256, 0.87);
}

.el-footer {
  background-color: #131313;
  display: flex;
  align-items: center;
  color: rgba(256, 256, 256, 0.6);
}
</style>
