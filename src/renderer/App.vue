<template lang="pug">
  el-container( v-if="!loading" style="height: 100vh;" )
    el-header
      Toolbar( :user="user" :fetching="fetching" )

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
import {
  faLogin,
  getSubs,
  getAriaConfig,
  saveSubs,
  faFetchStart,
  faFetchStop
} from "./api";
import bus from "@/renderer/utils/EventBus";

// 组件
import Toolbar from "./components/header/Toolbar.vue";
import SubTable from "./components/main/SubTable.vue";
import { AriaConfig } from "../main/database";
import ipc from "electron-promise-ipc";

@Component({
  components: { Toolbar, SubTable }
})
export default class App extends Vue {
  @ProvideReactive() subs: Subscription[] = [];
  @ProvideReactive() ariaConfig: AriaConfig | null = null;

  loading: boolean = true;
  user: User | null = null;
  fetching: boolean = false;

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
   * 初始化总线事件回调和ipc事件回调
   */
  initHandle() {
    bus.$on("header.login", this.handleLogin);
    bus.$on("header.logout", this.handleLogout);
    bus.$on("sub.add", this.handleSubAdd);
    bus.$on("sub.start", this.handleSubStart);
    bus.$on("header.stop", this.handleHeaderStop);
    bus.$on("sub.delete", this.handleSubDelete);

    ipc.on("sub.update", this.handleIpcSubUpdate as any);
    ipc.on("task.update", this.handleIpcTaskUpdate as any);
    ipc.on("log.update", this.handleIpcLogUpdate as any);
  }

  handleLogin(user: User) {
    this.user = user;
    cache.set("user", user);
  }

  handleLogout() {
    this.user = null;
    cache.set("user", null);
  }

  async handleSubAdd(subs: Subscription[]) {
    if (subs.length > 0) {
      await saveSubs(subs);
      await this.initSubs();
      this.$message.success(this.$tc("sub.add", subs.length));
    }
  }

  async handleSubStart(subs: Subscription[]) {
    if (subs.length === 0) {
      this.$message.warning("请先选择要开始下载的订阅");
      return;
    }
    this.$message.info("开始下载" + subs.length + "个订阅");
    this.fetchStart(subs);
  }

  async handleHeaderStop() {
    console.log("停止");
    this.fetchStop();
  }

  async handleSubDelete(subs: Subscription[]) {
    if (subs.length === 0) {
      this.$message.warning("请先选择要删除的订阅");
    }
  }

  async fetchStart(subs: Subscription[]) {
    if (this.fetching) {
      return;
    }

    this.fetching = true;
    try {
      await faFetchStart(subs);
    } catch (e) {
      this.$message.error(e.message);
      console.error(e);
    }
    this.fetching = false;
  }

  fetchStop() {
    faFetchStop();
  }

  async handleIpcSubUpdate(id: string) {
    console.log("sub.update", id);
  }

  async handleIpcTaskUpdate(id: string) {
    console.log("task.update", id);
  }

  async handleIpcLogUpdate(id: string) {
    console.log("log.update", id);
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
