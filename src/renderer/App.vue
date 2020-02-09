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
import { Subscription, Task } from "@/main/database/entity";
import logger from "@/shared/logger";
import { User } from "./interface";
import cache from "@/renderer/utils/Cache";
import {
  faLogin,
  getSubs,
  getAriaConfig,
  saveSubs,
  faFetchStart,
  faFetchStop,
  getSub
} from "./api";
import bus from "@/renderer/utils/EventBus";
import { AriaConfig } from "../main/database";
import ipc from "electron-promise-ipc";
import _ from "lodash";

// 组件
import Toolbar from "./components/header/Toolbar.vue";
import SubTable from "./components/main/SubTable.vue";

@Component({
  components: { Toolbar, SubTable }
})
export default class App extends Vue {
  @ProvideReactive() subs: Subscription[] = [];
  @ProvideReactive() ariaConfig: AriaConfig | null = null;

  loading: boolean = true;
  user: User | null = null;
  fetching: boolean = false;

  subUpdateList: string[] = [];
  taskUpdateList: string[] = [];
  logUpdateList: string[] = [];

  // 创建节流函数，最快500毫秒执行一次
  doSubUpdateThrottle: Function = _.throttle(this.doSubUpdate, 500);
  doTaskUpdateThrottle: Function = _.throttle(this.doTaskUpdate, 500);
  doLogUpdateThrottle: Function = _.throttle(this.doLogUpdate, 500);

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
    ipc.on("task.add", this.handleIpcTaskAdd as any);
    ipc.on("log.update", this.handleIpcLogUpdate as any);
  }

  /**
   * 用户登录回调
   */
  handleLogin(user: User) {
    this.user = user;
    cache.set("user", user);
  }

  /**
   * 用户注销回调
   */
  handleLogout() {
    this.user = null;
    cache.set("user", null);
  }

  /**
   * 添加订阅回调
   */
  async handleSubAdd(subs: Subscription[]) {
    if (subs.length > 0) {
      await saveSubs(subs);
      await this.initSubs();
      this.$message.success(this.$tc("sub.add", subs.length));
    }
  }

  /**
   * 开始下载订阅回调
   */
  async handleSubStart(subs: Subscription[]) {
    if (subs.length === 0) {
      this.$message.warning("请先选择要开始下载的订阅");
      return;
    }
    this.$message.info("开始下载" + subs.length + "个订阅");
    this.fetchStart(subs);
  }

  /**
   * 停止下载订阅回调
   */
  async handleHeaderStop() {
    console.log("停止");
    this.fetchStop();
  }

  /**
   * 删除订阅回调
   */
  async handleSubDelete(subs: Subscription[]) {
    if (subs.length === 0) {
      this.$message.warning("请先选择要删除的订阅");
    }
  }

  /**
   * 通知主进程开始获取
   */
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

  /**
   * 通知主进程停止获取
   */
  fetchStop() {
    faFetchStop();
  }

  /**
   * 更新订阅回调
   */
  async handleIpcSubUpdate(id: string) {
    console.log("sub.update", id);
    this.subUpdateList.push(id);
    this.doSubUpdateThrottle();
  }

  /**
   * 添加任务回调
   */
  async handleIpcTaskAdd(task: Task) {
    console.log("task.add", task);
  }

  /**
   * 日志更新回调
   */
  async handleIpcLogUpdate(id: string) {
    console.log("log.update", id);
  }

  /**
   * 执行订阅更新
   */
  async doSubUpdate() {
    // 去重
    const list = _.uniq(this.subUpdateList);
    // 清空等待列表
    this.subUpdateList = [];
    for (const id of list) {
      const sub = await getSub(id);
      if (!sub) {
        continue;
      }

      // 遍历订阅并更新
      // TODO: 可以使用hash来提升效率
      for (let index = 0; index < this.subs.length; index++) {
        const s = this.subs[index];
        if (s.id === sub.id) {
          this.$set(this.subs, index, sub);
          break;
        }
      }
    }
  }

  async doTaskUpdate() {}

  async doLogUpdate() {}
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
