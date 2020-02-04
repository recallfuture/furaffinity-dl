<template lang="pug">
  v-app( v-if="!loading" )
    //- 错误提示
    v-snackbar( v-model="alert" top :color="alertType" )
      span {{ alertMessage }}
      v-btn( @click="alert = false" icon )
        v-icon mdi-close
      
    v-dialog( v-model="migrateDialog" width="400" persistent )
      v-card
        v-card-title 正在升级数据库
        v-card-text {{ migrateStatus.current }}/{{ migrateStatus.total }}
          v-progress-linear( :value="migrateStatus.current/migrateStatus.total*100" )

    //- 全局使用的组件
    guide(
      v-model="guide"
      :config="config"
      :user="user"
      @user:login="login"
      @config:update="updateConfig"
    )
    add-sub-dialog(
      v-model="addSubDialog"
      :config="config"
      :subs="subsHash"
      @subs:new="addSubs"
    )

    //- 订阅抽屉栏
    Drawer(
      v-model="drawer"
      title="订阅"
      :sort="sort"
      :subs="sortedSubs"
      :fetching="fetching"
      @sort:change="changeSort"
      @addSub:open="addSubDialog = true"
      @sub:select="selectSub"
      @sub:startAll="startAll"
      @sub:pauseAll="pauseAll"
      @sub:delete="deleteSub"
    )

    //- 应用栏
    v-app-bar( app )
      v-app-bar-nav-icon( @click="drawer = !drawer" )
      v-toolbar-title Furaffinity-dl
      v-spacer
      v-btn( text ) 全局下载速度：{{ downloadSpeedFormat }}
      v-spacer
      //- 登录前
      v-btn( v-if="!user" @click="loginDialog = true" text ) 登录
      user-login( v-model="loginDialog" )
      //- 登录后
      user( v-if="user" :user="user" )
      v-btn( v-if="user" @click="logoutDialog = true" text ) 注销
      user-logout( v-model="logoutDialog" )
      //- 调试
      v-btn( @click="openDevtools" text ) 调试
        
    
    v-content(  )
      v-fade-transition
        Detail(
          v-if="currentSub"
          :sub="currentSub"
          :galleryTasks="galleryTasks"
          :scrapsTasks="scrapsTasks"
          :logs="currentSubLogs"
          style="position: absolute; width: 100%; height: 100%"
        )
        h2( v-else align="center" ) 未选择订阅
</template>

<script>
// 外部库
import { remote } from "electron";
import fs from "fs";
import { promisify } from "util";
import _ from "lodash";
import sleep from "sleep-promise";
import ipc from "electron-promise-ipc";
import rm from "rimraf";

// 内部库
import {
  faLogin,
  faGallery,
  faScraps,
  faSubmission,
  initClient,
  addUri,
  fetchTaskItem,
  resumeAllTask,
  pauseAllTask,
  onDownloadStart,
  onDownloadPause,
  onDownloadStop,
  onDownloadComplete,
  onDownloadError,
  resumeTask,
  pauseTask,
  getGlobalStat,
  isNeedMgrate,
  migrate
} from "@/renderer/api";
import bus from "./utils/EventBus";
import cache from "./utils/Cache";
import logger from "@/shared/logger";
import * as db from "./api/database";
import { Log, Task, TaskType } from "../main/database/entity";

// 组件
import Guide from "@/renderer/components/Guide/Guide";
import AddSubDialog from "@/renderer/components/Subscription/AddSubDialog";
import User from "@/renderer/components/Main/User";
import UserLogin from "@/renderer/components/Main/UserLogin";
import UserLogout from "@/renderer/components/Main/UserLogout";
import Drawer from "@/renderer/components/Main/Drawer";
import Detail from "@/renderer/components/Detail/Detail";

const existsAsync = promisify(fs.exists);

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
      loginDialog: false,
      logoutDialog: false,
      migrateDialog: false,
      migrateStatus: { current: 0, total: 1 },

      user: null,
      sort: "按名称升序排序",
      subs: [],
      subSelected: undefined,
      currentSub: null,
      currentSubTasks: [],
      currentSubLogs: [],
      config: {},

      retry: 3,
      maxLogLines: 100,
      downloadSpeed: "0",
      fetching: false,
      fetchingList: []
    };
  },

  async mounted() {
    await this.initUser();
    await this.initSubs();
    await this.initConfig();
    await this.initGuide();
    await this.initAria();

    // 全局事件绑定
    bus.$on("snackbar", this.showSnackBar);
    bus.$on("login", this.login);
    bus.$on("logout", this.logout);
    bus.$on("clearLog", this.clearSubLog);

    ipc.on("app.migrateStatus", status => {
      this.migrateStatus = status;
    });

    this.initMigrate();
    this.loading = false;
  },

  components: {
    Guide,
    AddSubDialog,
    User,
    UserLogin,
    UserLogout,
    Drawer,
    Detail
  },

  computed: {
    subsHash() {
      const hash = {};
      for (const sub of this.subs) {
        hash[sub.id] = sub;
      }
      return hash;
    },

    galleryTasks() {
      return this.currentSubTasks.filter(task => task.type === "gallery");
    },

    scrapsTasks() {
      return this.currentSubTasks.filter(task => task.type === "scraps");
    },

    downloadSpeedFormat() {
      const b = parseInt(this.downloadSpeed, 10);
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (b === 0) {
        return "0 KB";
      }
      const i = parseInt(Math.floor(Math.log(b) / Math.log(1024)), 10);
      if (i === 0) {
        return `${b} ${sizes[i]}`;
      }
      return `${(b / 1024 ** i).toFixed(1)} ${sizes[i]}`;
    },

    sortedSubs() {
      switch (this.sort) {
        case "按名称升序排序": {
          return _.orderBy(this.subs, "id", "asc");
        }
        case "按名称降序排序": {
          return _.orderBy(this.subs, "id", "desc");
        }
        case "按添加时间升序排序": {
          return _.orderBy(this.subs, "createAt", "asc");
        }
        case "按添加时间降序排序": {
          return _.orderBy(this.subs, "createAt", "desc");
        }
        default:
          return this.subs;
      }
    }
  },

  methods: {
    async initMigrate() {
      if (await isNeedMgrate()) {
        this.migrateDialog = true;
        await migrate();
        await this.initSubs();
        await this.initConfig();
        this.migrateDialog = false;
        this.showSnackBar({ message: "数据库升级完成" });
      }
    },

    // 初始化用户信息
    async initUser() {
      const user = cache.get("user");
      if (user) {
        this.user = user;
        await faLogin(user.a, user.b);
      }
    },

    // 初始化订阅信息
    async initSubs() {
      // 获取数据库中所有的订阅
      const subs = await db.getSubs();

      for (const sub of subs) {
        // 复位下载状态
        sub.status = "";
        this.subs.push(sub);
      }
    },

    // 初始化配置信息
    async initConfig() {
      this.config = await db.getAriaConfig();
    },

    // 初始化向导
    async initGuide() {
      const firstTime = cache.get("first_time");
      if (firstTime === null) {
        // 一秒后弹出向导对话框
        setTimeout(() => (this.guide = true), 1000);
      }
    },

    // 初始化 aria
    async initAria() {
      await initClient(this.config);

      // 绑定回调
      onDownloadStart(this.onDownloadStart);
      onDownloadStop(this.onDownloadStop);
      onDownloadPause(this.onDownloadPause);
      onDownloadComplete(this.onDownloadComplete);
      onDownloadError(this.onDownloadError);

      // 定时更新全局下载速度
      setInterval(async () => {
        const stat = await getGlobalStat();
        this.downloadSpeed = stat.downloadSpeed;
      }, 200);
    },

    // 显示提示
    showSnackBar({ type = "info", message = "" }) {
      this.alert = true;
      this.alertType = type;
      this.alertMessage = message;
    },

    // 添加订阅
    async addSubs(subs) {
      await db.addSubs(subs);

      if (subs.length > 0) {
        this.subs = await db.getSubs();
        this.showSnackBar({ message: `成功添加${subs.length}个订阅` });
      }
    },

    async deleteSub(index, { deleteFiles }) {
      await this.pauseAll();
      logger.log(index);
      if (index in this.sortedSubs) {
        // 获取要删除的订阅
        const sub = this.sortedSubs[index];
        // 如果当前选中的就是它，就取消选中
        if (this.currentSub.id === sub.id) {
          this.currentSub = null;
        }
        // 从数据库删除订阅
        await db.removeSub(sub.id);
        // 刷新订阅列表
        this.subs = await db.getSubs();
        // 删除订阅文件夹
        if (deleteFiles) {
          if (await existsAsync(sub.dir)) {
            await rm(sub.dir, {}, () => {});
          }
        }
      }
    },

    changeSort(value) {
      this.sort = value;
    },

    openDevtools() {
      remote.getCurrentWebContents().openDevTools();
    },

    // 选中某个订阅
    async selectSub(value) {
      this.subSelected = value;
      if (typeof value !== "undefined") {
        // 获取当前所有任务和日志
        this.currentSub = this.sortedSubs[value];
        this.currentSubTasks = await db.getTasks(this.currentSub.id);
        this.currentSubLogs = await db.getLogs(this.currentSub.id);

        // 更新gallery和scraps的真实个数
        this.currentSub.galleryTaskNum = this.galleryTasks.length;
        this.currentSub.scrapsTaskNum = this.scrapsTasks.length;
        await db.saveSub(this.currentSub);
      } else {
        this.currentSub = null;
      }
    },

    // 登录
    login(user) {
      this.user = user;
      cache.set("user", user);
    },

    // 注销
    logout() {
      this.user = null;
      cache.set("user", null);
    },

    // 更新设置
    async updateConfig(config) {
      // 更新本地设置
      this.config = { ...this.config, ...config };
      await db.saveAriaConfig(this.config);
    },

    // 开始
    async startAll() {
      if (this.fetching) {
        return;
      }

      if (this.sortedSubs.length === 0) {
        return;
      }

      // 开始获取
      this.fetching = true;
      // 从选中处开始下载
      if (this.subSelected in this.sortedSubs) {
        this.fetchingList = this.sortedSubs.slice(this.subSelected);
      } else {
        this.fetchingList = [...this.sortedSubs];
      }

      // 开始获取并下载
      await resumeAllTask();
      await this.mapSubs(this.fetchingList);

      // 结束获取
      this.fetching = false;
    },

    // 暂停
    async pauseAll() {
      this.fetching = false;
      await pauseAllTask();
    },

    // 添加任务日志
    async addSubLog(sub, { type = "info", message = "" }) {
      const log = { type, message, createAt: new Date().getTime(), sub: sub };
      if (this.currentSub && this.currentSub.id === sub.id) {
        this.currentSubLogs.push(log);
      }
      // TODO: 删除多出来的log
      await db.addLog(log);
    },

    // 清空任务日志
    async clearSubLog(id) {
      if (this.currentSub && this.currentSub.id === id) {
        this.currentSubLogs = [];
      }
      await db.clearLogs(id);
    },

    // 遍历订阅下载列表
    async mapSubs(subs) {
      // 获取当前订阅
      for (const sub of subs) {
        this.$set(sub, "status", "active");

        // 下载的图集
        const types = { gallery: sub.gallery, scraps: sub.scraps };
        for (const type in types) {
          if (!types[type] || !this.fetching) {
            continue;
          }

          try {
            // 下载此图集的所有图片
            this.addSubLog(sub, { message: `[${type}] 开始获取` });
            await this.mapPages(type, { sub });
          } catch (e) {
            this.addSubLog(sub, {
              type: "error",
              message: `[${type}] 出现错误，停止获取：${e.message}`
            });
            logger.error(e);
            this.$set(sub, "status", "error");
          }
        }
        this.$set(sub, "status", "");
      }
    },

    // 遍历所有页
    async mapPages(type, { sub } = {}) {
      for (let page = 1; this.fetching; page++) {
        let times = 0;
        let result = null;

        while (times++ < this.retry) {
          if (type === "gallery") {
            result = await faGallery(sub.id, page);
          } else {
            result = await faScraps(sub.id, page);
          }

          if (result === null) {
            this.addSubLog(sub, {
              type: "error",
              message: `[${type}/${page}] 获取失败，1秒后进行第${times}次重试`
            });
            logger.error("获取作品列表失败", sub, type, page);
            await sleep(1000);
          } else {
            break;
          }
        }

        if (result === null) {
          throw new Error("获取作品列表失败");
        }

        if (result.length === 0) {
          this.addSubLog(sub, { message: `[${type}] 获取结束` });
          logger.log("页数到头了", sub, type, page);
          break;
        }

        await this.mapSubmissions(result, { sub, type, page });
      }
    },

    // 遍历作品列表
    async mapSubmissions(submissions, { sub, type, page } = {}) {
      for (
        let index = 0;
        index < submissions.length && this.fetching;
        index++
      ) {
        // 获取当前作品
        const submission = submissions[index];

        // 先判断数据库中有没有
        let task = await db.getTask(submission.id);
        if (task) {
          // 检查是否需要添加此任务
          if (await this.checkTask(task)) {
            this.addSubLog(sub, {
              message: `[${type}/${page}/${index + 1}] 跳过`
            });
            logger.log("跳过此作品", sub, type, page, index + 1);
            continue;
          }
        }

        let times = 0;
        let submissionDetail = null;

        if (task) {
          submissionDetail = task;
        } else {
          while (times++ < this.retry) {
            // 从网络获取作品详情
            submissionDetail = await faSubmission(submission.id);
            if (submissionDetail === null) {
              this.addSubLog(sub, {
                type: "error",
                message: `[${type}/${page}/${index +
                  1}] 作品详情获取失败，1秒后进行第${times}次重试`
              });
              logger.error("作品详情获取失败", sub, type, page, index + 1);
              await sleep(1000);
            } else {
              break;
            }
          }

          if (submissionDetail === null) {
            throw new Error("作品详情获取失败");
          }
        }

        this.addSubLog(sub, { message: `[${type}/${page}/${index + 1}] 开始` });
        logger.log("作品详情", sub, type, page, index + 1);

        // 添加下载任务
        const url = submissionDetail.downloadUrl;
        const dir = sub[type + "Dir"];
        const gid = await this.addTask(url, dir);
        await pauseTask({ gid });

        // 缓存当前任务
        if (task) {
          task.gid = gid;
          task.status = "";
          await this.saveTask({ sub, type, task, create: false });
        } else {
          task = new Task();
          task.gid = gid;
          task.id = submissionDetail.id;
          task.url = submissionDetail.url;
          task.downloadUrl = submissionDetail.downloadUrl;
          task.type = type;
          task.sub = sub;
          await this.saveTask({ sub, type, task, create: true });
        }
      }
    },

    // 检查任务是否需要添加
    // 返回 true 意为不需要添加
    async checkTask(task) {
      const { gid, status } = task;
      if (!gid || !status) {
        return false;
      }

      try {
        // 如果已完成且文件存在就返回true
        if (status === "complete") {
          if (task.path) {
            return await existsAsync(task.path);
          } else {
            return false;
          }
        }

        // 如果未完成就检查是否正在下载
        const item = await fetchTaskItem({ gid });
        if (item.status === "active") {
          return true;
        } else if (item.status === "pause") {
          await resumeTask({ gid });
          return true;
        } else {
          return false;
        }
      } catch (e) {
        logger.log("任务已失效", e);
        // 此任务已经失效
        return false;
      }
    },

    // 添加任务到 aria2
    async addTask(url, dir) {
      return await addUri({
        uris: [url],
        options: { dir }
      });
    },

    // 缓存任务
    async saveTask({ sub, type, task, create }) {
      await db.saveTask(task);
      if (this.currentSub && this.currentSub.id === sub.id && create) {
        // 如果当前选中的订阅就是这个订阅，且库内没有这个作品，就更新界面
        this.currentSubTasks.push(task);
      }
      if (create) {
        // 如果库内没有这个作品，就更新数字
        if (task.type === TaskType.Gallery) {
          sub.galleryTaskNum++;
        } else {
          sub.scrapsTaskNum++;
        }
        await db.saveSub(sub);
      }
      await resumeTask({ gid: task.gid });
    },

    async onDownloadStart(event) {
      const [{ gid }] = event;
      logger.log("任务开始", gid);
      await this.refreshTask(gid);
    },

    async onDownloadComplete(event) {
      const [{ gid }] = event;
      logger.log("任务完成", gid);
      await this.refreshTask(gid);
    },

    async onDownloadPause(event) {
      const [{ gid }] = event;
      logger.log("任务暂停", gid);
      await this.refreshTask(gid);
    },

    async onDownloadStop(event) {
      const [{ gid }] = event;
      logger.log("任务停止", gid);
      await this.refreshTask(gid);
    },

    async onDownloadError(event) {
      const [{ gid }] = event;
      logger.log("任务失败", gid);
      await this.refreshTask(gid);
    },

    // 更新任务信息
    async refreshTask(gid) {
      // 获取任务信息
      const item = await fetchTaskItem({ gid });
      const task = await db.getTaskByGid(gid);
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
        await db.saveTask(task);
        // 更新界面
        if (this.currentSub && this.currentSub.id === task.sub.id) {
          for (let index = 0; index < this.currentSubTasks.length; index++) {
            const t = this.currentSubTasks[index];
            if (t.id === task.id) {
              this.$set(this.currentSubTasks, index, task);
              break;
            }
          }
        }
      }
    }
  }
};
</script>
