<template lang="pug">
  el-container( class="app" )
    el-header
      Toolbar( :user="user" :downloading="fetching" )

    el-main
      SubTable()
      SubDetail(
        v-show="detail.show"
        :sub="detail.sub"
        :tasks="detail.tasksStatus"
        :logs="detail.logs"
      )

    el-footer
      UserInfo( v-if="detail.sub" :sub="detail.sub" )
      span( v-else ) 未选择订阅
      el-button( v-if="detail.sub && detail.show" type="text" icon="el-icon-arrow-down" @click="handleDetailHide" )
      el-button( v-if="detail.sub && !detail.show" type="text" icon="el-icon-arrow-up" @click="handleDetailShow" )
      
      div( class="spacer" )

      SpeedBar( :ariaStatus="ariaStatus" )
</template>

<script lang="ts">
import { Vue, Component, Prop, ProvideReactive } from "vue-property-decorator";
import { Subscription, Task, Log } from "@/main/database/entity";
import logger from "@/shared/logger";
import { User, Detail, AriaStatus } from "@/shared/interface";
import cache from "@/renderer/utils/Cache";
import {
  faLogin,
  getSubs,
  getAriaConfig,
  saveSubs,
  faFetchStart,
  faFetchStop,
  getSub,
  getLogs,
  getTasksStatus,
  getGlobalStat
} from "./api";
import bus from "@/renderer/utils/EventBus";
import { AriaConfig } from "../main/database";
import ipc from "electron-promise-ipc";
import _ from "lodash";

// 组件
import Toolbar from "./components/header/Toolbar.vue";
import SubTable from "./components/main/SubTable.vue";
import SubDetail from "./components/main/SubDetail.vue";
import UserInfo from "./components/generic/User.vue";
import SpeedBar from "./components/footer/SpeedBar.vue";

@Component({
  components: { Toolbar, SubTable, SubDetail, UserInfo, SpeedBar }
})
export default class App extends Vue {
  @ProvideReactive() subs: Subscription[] = [];
  @ProvideReactive() ariaConfig: AriaConfig | null = null;

  user: User | null = null;
  fetching: boolean = false;

  ariaStatus: AriaStatus = {
    downloadSpeed: "0",
    numActive: "0",
    numStopped: "0",
    numStoppedTotal: "0",
    numWaiting: "0",
    uploadSpeed: "0"
  };

  detail: Detail = {
    show: false,
    sub: null,
    tasksStatus: {
      gallery: 0,
      galleryComplete: 0,
      galleryActive: 0,
      scraps: 0,
      scrapsComplete: 0,
      scrapsActive: 0
    },
    logs: []
  };

  async mounted() {
    try {
      await this.initConfig();
      await this.initUser();
      await this.initSubs();
      this.initAria();
      this.initHandle();
    } catch (e) {
      this.$alert(e);
    }
  }

  async initConfig() {
    this.ariaConfig = await getAriaConfig();
    logger.log("配置初始化完成");
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
    logger.log("用户信息初始化完成");
  }

  /**
   * 初始化订阅列表
   */
  async initSubs() {
    this.subs = await getSubs();
    logger.log("订阅初始化完成");
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
    bus.$on("sub.deleted", this.handleSubDeleted);
    bus.$on("sub.select", this.handleSubSelect);
    bus.$on("detail.show", this.handleDetailShow);
    bus.$on("detail.hide", this.handleDetailHide);

    ipc.on("sub.update", this.handleIpcSubUpdate as any);
    ipc.on("task.update", this.handleIpcTaskUpdate as any);
    ipc.on("log.add", this.handleIpcLogAdd as any);
    ipc.on("log.clear", this.handleIpcLogClear as any);
  }

  /**
   * 初始化Aria
   */
  async initAria() {
    setInterval(async () => {
      this.ariaStatus = await getGlobalStat();
    }, 200);
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

  async handleSubSelect(sub: Subscription) {
    if (!sub) {
      return;
    }

    if (this.detail.sub && this.detail.sub.id === sub.id) {
      this.detail.show = true;
      return;
    }

    this.detail.sub = sub;
    this.detail.tasksStatus = await getTasksStatus(sub.id);
    this.detail.logs = await getLogs(sub.id);
    this.detail.show = true;
  }

  handleDetailShow() {
    this.detail.show = true;
  }

  handleDetailHide() {
    this.detail.show = false;
  }

  /**
   * 停止下载订阅回调
   */
  async handleHeaderStop() {
    logger.log("停止");
    this.fetchStop();
  }

  async handleSubDeleted(subs: Subscription[]) {
    if (
      this.detail.sub &&
      subs.filter(sub => sub.id === this.detail.sub?.id).length > 0
    ) {
      this.detail.show = false;
      this.detail.sub = null;
    }
    await this.initSubs();
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
      logger.error(e);
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
  async handleIpcSubUpdate(subs: Subscription[]) {
    this.doSubUpdate(subs);
  }

  /**
   * 添加任务回调
   */
  async handleIpcTaskUpdate() {
    if (this.detail.sub) {
      this.detail.tasksStatus = await getTasksStatus(this.detail.sub.id);
    }
  }

  /**
   * 日志更新回调
   */
  async handleIpcLogAdd(logs: Log[]) {
    this.doLogAdd(logs);
  }

  /**
   * 日志更新回调
   */
  async handleIpcLogClear(id: string) {
    this.doLogClear(id);
  }

  /**
   * 执行订阅更新
   */
  async doSubUpdate(subs: Subscription[]) {
    for (const sub of subs) {
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

  /**
   * 执行日志添加
   */
  async doLogAdd(logs: Log[]) {
    for (const log of logs) {
      if (this.detail.sub && this.detail.sub.id === log.sub?.id) {
        this.detail.logs.push(log);
      }
    }
  }

  /**
   * 执行日志清空
   */
  async doLogClear(id: string) {
    if (this.detail.sub && this.detail.sub.id === id) {
      this.detail.logs = [];
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

.app {
  height: 100vh;
}

.app .el-header {
  background-color: #121212;
  color: rgba(256, 256, 256, 0.87);
}

.app .el-main {
  background-color: #222;
  color: rgba(256, 256, 256, 0.87);
  display: flex;
  flex-direction: column;
}

.app .el-footer {
  background-color: #131313;
  display: flex;
  align-items: center;
  color: rgba(256, 256, 256, 0.6);
}
</style>
