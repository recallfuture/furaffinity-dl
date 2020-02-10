<template lang="pug">
  el-container( v-if="!loading" class="app" )
    el-header
      Toolbar( :user="user" :downloading="fetching || downloading" )

    el-main
      SubTable()
      SubDetail(
        v-show="detail.show"
        :sub="detail.sub"
        :tasks="detail.tasks"
        :logs="detail.logs"
      )

    el-footer
      UserInfo( v-if="detail.sub" :sub="detail.sub" )
      el-button( v-if="detail.sub && detail.show" type="text" icon="el-icon-arrow-down" @click="handleDetailHide" )
      el-button( v-if="detail.sub && !detail.show" type="text" icon="el-icon-arrow-up" @click="handleDetailShow" )
      
      div( class="spacer" )

      SpeedBar( :ariaStatus="ariaStatus" )
</template>

<script lang="ts">
import { Vue, Component, Prop, ProvideReactive } from "vue-property-decorator";
import { Subscription, Task, Log } from "@/main/database/entity";
import logger from "@/shared/logger";
import { User, Detail, AriaStatus } from "./interface";
import cache from "@/renderer/utils/Cache";
import {
  faLogin,
  getSubs,
  getAriaConfig,
  saveSubs,
  faFetchStart,
  faFetchStop,
  getSub,
  getTasks,
  getLogs,
  addUri,
  saveTask,
  getGlobalStat,
  onDownloadStart,
  onDownloadStop,
  onDownloadComplete,
  onDownloadError,
  onDownloadPause,
  fetchTaskItem,
  getTaskByGid,
  initClient,
  removeAllTask,
  purgeTaskRecord,
  saveSession,
  pauseAllTask
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

  loading: boolean = true;
  user: User | null = null;
  fetching: boolean = false;

  subUpdateList: string[] = [];
  taskAddList: Task[] = [];
  taskUpdateList: Task[] = [];
  logUpdateList: string[] = [];

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
    tasks: [],
    logs: []
  };

  // 创建节流函数，最快500毫秒执行一次
  doSubUpdateThrottle: Function = _.throttle(this.doSubUpdate, 500);
  doTaskAddThrottle: Function = _.throttle(this.doTaskAdd, 500);
  doTaskUpdateThrottle: Function = _.throttle(this.doTaskUpdate, 500);
  doLogUpdateThrottle: Function = _.throttle(this.doLogUpdate, 500);

  get downloading() {
    return !!(
      Number.parseInt(this.ariaStatus.numActive) +
      Number.parseInt(this.ariaStatus.numWaiting)
    );
  }

  async mounted() {
    try {
      await this.initConfig();
      await this.initUser();
      await this.initSubs();
      await this.initAria();
      this.initHandle();
    } catch (e) {
      this.$alert(e);
    }
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
    bus.$on("sub.select", this.handleSubSelect);
    bus.$on("detail.show", this.handleDetailShow);
    bus.$on("detail.hide", this.handleDetailHide);

    ipc.on("sub.update", this.handleIpcSubUpdate as any);
    ipc.on("task.add", this.handleIpcTaskAdd as any);
    ipc.on("log.update", this.handleIpcLogUpdate as any);
  }

  /**
   * 初始化Aria
   */
  async initAria() {
    if (!this.ariaConfig) {
      console.error("Aria init error");
      return;
    }

    await initClient(this.ariaConfig);

    onDownloadStart((event: any) => this.handleDownloadStart(event));
    onDownloadStop((event: any) => this.handleDownloadStop(event));
    onDownloadComplete((event: any) => this.handleDownloadComplete(event));
    onDownloadError((event: any) => this.handleDownloadError(event));
    onDownloadPause((event: any) => this.handleDownloadPause(event));

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
    this.detail.tasks = await getTasks(sub.id);
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
    console.log("停止");
    this.fetchStop();
    await removeAllTask();
    await purgeTaskRecord();
    await saveSession();
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
    this.subUpdateList.push(id);
    this.doSubUpdateThrottle();
  }

  /**
   * 添加任务回调
   */
  async handleIpcTaskAdd(task: Task) {
    this.taskAddList.push(task);
    this.doTaskAddThrottle();
  }

  /**
   * 添加任务回调
   */
  async handleIpcTaskUpdate(task: Task) {
    this.taskUpdateList.push(task);
    this.doTaskUpdateThrottle();
  }

  /**
   * 日志更新回调
   */
  async handleIpcLogUpdate(id: string) {
    this.logUpdateList.push(id);
    this.doLogUpdateThrottle();
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

  async doTaskAdd() {
    // 去重
    const list = _.uniq(this.taskAddList);
    this.taskAddList = [];
    let update = false;
    for (const task of list) {
      // 逐个添加订阅
      task.gid = await addUri({
        uris: [task.downloadUrl],
        options: {
          dir:
            task.type === "gallery"
              ? task.sub?.galleryDir ?? ""
              : task.sub?.scrapsDir ?? ""
        }
      });
      await saveTask(task);
      this.handleIpcTaskUpdate(task);
    }
  }

  async doTaskUpdate() {
    // 去重
    const list = _.uniq(this.taskUpdateList);
    // 清空等待列表
    this.taskUpdateList = [];

    if (!this.detail.sub) {
      return;
    }

    for (const task of list) {
      if (!task.sub) {
        continue;
      }

      if (this.detail.sub.id === task.sub.id) {
        this.detail.tasks = await getTasks(task.sub.id);
        break;
      }
    }
  }

  async doLogUpdate() {
    // 去重
    const list = _.uniq(this.logUpdateList);
    // 清空等待列表
    this.logUpdateList = [];

    if (!this.detail.sub) {
      return;
    }

    for (const id of list) {
      if (this.detail.sub.id === id) {
        this.detail.logs = await getLogs(id);
        break;
      }
    }
  }

  async handleDownloadStart(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid);
    logger.log("任务开始", gid);
  }

  async handleDownloadComplete(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid);
    logger.log("任务完成", gid);
  }

  async handleDownloadPause(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid);
    logger.log("任务暂停", gid);
  }

  async handleDownloadStop(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid);
    logger.log("任务停止", gid);
  }

  async handleDownloadError(event: any) {
    const [{ gid }] = event;
    await this.refreshTask(gid);
    logger.log("任务失败", gid);
  }

  // 更新任务信息
  async refreshTask(gid: string) {
    // 获取任务信息
    const item = await fetchTaskItem({ gid });
    const task = await getTaskByGid(gid);
    if (task) {
      // 覆盖任务状态
      task.status = item.status;
      // 覆盖文件位置
      // 任务完成后可以或得到文件位置
      if (item.status === "complete") {
        task.path = item.files[0].path;
        logger.log("文件下载到", item.files[0].path);
      }
      // 保存到数据库
      await saveTask(task);
      // 更新界面
      if (this.detail.sub && this.detail.sub.id === task.sub?.id) {
        this.handleIpcTaskUpdate(task);
      }
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
