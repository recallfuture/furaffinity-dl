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
      :subs="subs"
      :fetching="fetching"
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
      //- 登录前
      v-btn( v-if="!user" @click="loginDialog = true" text ) 登录
      user-login( v-model="loginDialog" )
      //- 登录后
      user( v-if="user" :user="user" )
      v-btn( v-if="user" @click="logoutDialog = true" text ) 注销
      user-logout( v-model="logoutDialog" )
        
    
    v-content(  )
      v-fade-transition
        Detail(
          v-if="subSelected in subs"
          :sub="subs[subSelected]"
          style="position: absolute; width: 100%; height: 100%"
        )
        h2( v-else align="center" ) 未选择订阅
</template>

<script>
// @ is an alias to /src
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
  resumeTask
} from "@/renderer/api";
import { remote } from "electron";
import bus from "./utils/EventBus";
import cache from "./utils/Cache";
import logger from "@/shared/logger";
import fs from "fs";
import { promisify } from "util";
import _ from "lodash";
import sleep from "sleep-promise";

const db = remote.getGlobal("db");

function toPromise(fun) {
  return (...args) =>
    new Promise((resolve, reject) => {
      try {
        resolve(fun(...args));
      } catch (e) {
        reject(e);
      }
    });
}

const existsAsync = promisify(fs.exists);

// 组件
import Guide from "@/renderer/components/Guide/Guide";
import AddSubDialog from "@/renderer/components/Subscription/AddSubDialog";
import User from "@/renderer/components/Main/User";
import UserLogin from "@/renderer/components/Main/UserLogin";
import UserLogout from "@/renderer/components/Main/UserLogout";
import Drawer from "@/renderer/components/Main/Drawer";
import Detail from "@/renderer/components/Detail/Detail";

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

      user: null,
      subs: [],
      subSelected: undefined,
      config: {},

      subsHash: {},
      tasksHash: {},
      submissionsHash: {},

      retry: 3,
      maxLogLines: 100,
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

  methods: {
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
      // FIX: 修复层级过深的对象解析时间过长的问题
      const subs = JSON.parse(await toPromise(db.subscription.getAll)());

      for (const sub of subs) {
        // 复位下载状态
        sub.status = "";
        this.subs.push(sub);

        // 缓存订阅信息
        this.$set(this.subsHash, sub.author.id, sub);

        // 缓存下载任务和作品
        const tasks = [...sub.galleryTasks, ...sub.scrapsTasks];
        for (const task of tasks) {
          if (task.gid) {
            this.$set(this.tasksHash, task.gid, task);
          }
          if (task.id) {
            this.$set(this.submissionsHash, task.id, task);
          }
        }
      }

      // 按添加时间排序
      this.subs = this.subs.sort((a, b) => {
        return b.createAt - a.createAt;
      });
    },

    // 初始化配置信息
    async initConfig() {
      this.config = {
        ...(await db.ariaConfig.get()),
        ...(await db.userConfig.get())
      };
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
    },

    // 显示提示
    showSnackBar({ type = "info", message = "" }) {
      this.alert = true;
      this.alertType = type;
      this.alertMessage = message;
    },

    // 添加订阅
    addSubs(subs) {
      let num = 0;
      for (const sub of subs) {
        if (sub.author.id in this.subsHash) {
          continue;
        }

        num++;
        this.subs.unshift(sub);
        this.$set(this.subsHash, sub.author.id, sub);
        toPromise(db.subscription.add)(sub);
      }

      if (num > 0) {
        this.showSnackBar({ message: `成功添加${num}个订阅` });
      }
    },

    async deleteSub(index, { deleteFiles }) {
      await this.pauseAll();

      if (index in this.subs) {
        // 移除订阅
        const sub = this.subs[index];
        this.subs.splice(index, 1);
        await toPromise(db.subscription.del)(sub.author.id);
        if (deleteFiles) {
          if (await existsAsync(sub.dir)) {
            fs.rmdirSync(sub.dir, { recursive: true });
          }
        }
      }
    },

    // 选中某个订阅
    selectSub(value) {
      this.subSelected = value;
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

      // 获取数据库中的设置
      const ariaConfig = await toPromise(db.ariaConfig.get)();
      const userConfig = await toPromise(db.userConfig.get)();
      for (const key in config) {
        if (key in ariaConfig) {
          ariaConfig[key] = config[key];
        } else if (key in userConfig) {
          userConfig[key] = config[key];
        }
      }
      // 更新数据库中的设置
      await toPromise(db.ariaConfig.set)(ariaConfig);
      await toPromise(db.userConfig.set)(userConfig);
    },

    // 开始
    async startAll() {
      if (this.fetching) {
        return;
      }

      if (this.subs.length === 0) {
        return;
      }

      // 开始获取
      this.fetching = true;
      // 从选中处开始下载
      if (this.subSelected in this.subs) {
        this.fetchingList = this.subs.slice(this.subSelected);
      } else {
        this.fetchingList = [...this.subs];
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
    addSubLog(sub, { type = "info", text = "" }) {
      sub.log.push({ type, text, timestamp: new Date().getTime() });
      if (sub.log.length > this.maxLogLines) {
        sub.log = sub.log.slice(sub.log.length - this.maxLogLines);
      }
      toPromise(db.subscription.set)(sub.author.id, sub);
    },

    // 清空任务日志
    clearSubLog(sub) {
      sub.log = [];
      toPromise(db.subscription.set)(sub.author.id, sub);
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
            this.addSubLog(sub, { text: `[${type}] 开始获取` });
            await this.mapPages(type, { sub });
          } catch (e) {
            this.addSubLog(sub, {
              type: "error",
              text: `[${type}] 出现错误，停止获取：${e.message}`
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
            result = await faGallery(sub.author.id, page);
          } else {
            result = await faScraps(sub.author.id, page);
          }

          if (result === null) {
            this.addSubLog(sub, {
              type: "error",
              text: `[${type}/${page}] 获取失败，1秒后进行第${times}次重试`
            });
            logger.error("获取作品列表失败", sub.author, type, page);
            await sleep(1000);
          } else {
            break;
          }
        }

        if (result === null) {
          throw new Error("获取作品列表失败");
        }

        if (result.length === 0) {
          this.addSubLog(sub, { text: `[${type}] 获取结束` });
          logger.log("页数到头了", sub.author, type, page);
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

        // 先判断缓存中有没有
        if (submission.id in this.submissionsHash) {
          // 获取缓存内的任务
          const task = this.submissionsHash[submission.id];
          // 检查是否需要添加此任务
          if (await this.checkTask(task)) {
            this.addSubLog(sub, {
              text: `[${type}/${page}/${index + 1}] 跳过`
            });
            logger.log("跳过此作品", sub.author, type, page, index + 1);
            continue;
          }
        }

        let times = 0;
        let submissionDetail = null;

        while (times++ < this.retry) {
          // 从网络获取作品详情
          submissionDetail = await faSubmission(submission.id);
          if (submissionDetail === null) {
            this.addSubLog(sub, {
              type: "error",
              text: `[${type}/${page}/${index +
                1}] 作品详情获取失败，1秒后进行第${times}次重试`
            });
            logger.error("作品详情获取失败", sub.author, type, page, index + 1);
            await sleep(1000);
          } else {
            break;
          }
        }

        if (submissionDetail === null) {
          throw new Error("作品详情获取失败");
        }

        this.addSubLog(sub, { text: `[${type}/${page}/${index + 1}] 开始` });
        logger.log("作品详情", sub.author, type, page, index + 1);

        // 添加下载任务
        const url = submissionDetail.downloadUrl;
        const dir = sub[type + "Dir"];
        const gid = await this.addTask(url, dir);

        // 缓存当前任务
        const task = { gid, ...submissionDetail };
        this.saveTask({ sub, type, task });
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
        switch (task.status) {
          case "active": {
            const item = await fetchTaskItem({ gid });
            this.$set(task, "status", item.status);
            return true;
          }
          case "paused": {
            // 暂停的任务就开始
            const item = await fetchTaskItem({ gid });
            this.$set(task, "status", item.status);
            return true;
          }
          case "stopped": {
            return false;
          }
          case "complete": {
            if (task.path) {
              return await existsAsync(task.path);
            } else {
              return false;
            }
          }
          case "error": {
            return false;
          }
          default: {
            return false;
          }
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
    saveTask({ sub, type, task }) {
      if (task.id in this.submissionsHash) {
        logger.log("命中缓存，修改任务", task);
        this.$set(this.submissionsHash[task.id], "gid", task.gid);
        this.$set(this.tasksHash, task.gid, this.submissionsHash[task.id]);
      } else {
        logger.log(
          "未命中缓存，直接添加任务",
          task,
          sub[type + "Tasks"].length
        );
        sub[type + "Tasks"].push(task);
        this.$set(this.submissionsHash, task.id, task);
        this.$set(this.tasksHash, task.gid, task);
      }
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
      // 通过 gid 获取到缓存中对应的任务
      if (gid in this.tasksHash) {
        const task = this.tasksHash[gid];
        // 覆盖任务状态
        this.$set(task, "status", item.status);
        // 覆盖文件位置
        // 任务完成后可以或得到文件位置
        if (item.status === "complete") {
          logger.log("文件下载到", item.files[0].path);
          this.$set(task, "path", item.files[0].path);
        }
        // 保存到数据库
        this.saveSub(this.subsHash[task.author.id]);
      }
    },

    // 保存订阅信息到数据库
    saveSub(sub) {
      logger.log("保存", sub.author.id);
      toPromise(db.subscription.set)(sub.author.id, sub);
    }
  }
};
</script>
