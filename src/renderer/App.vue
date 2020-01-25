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
      :downloading="downloading"
      @addSub:open="addSubDialog = true"
      @sub:select="selectSub"
      @sub:startAll="startAll"
      @sub:pauseAll="pauseAll"
    )

    //- 应用栏
    v-app-bar( app )
      v-app-bar-nav-icon( @click="drawer = !drawer" )
      v-toolbar-title Furaffinity-dl
      v-spacer
      user( :user="user" )
    
    v-content(  )
      Detail( v-if="subSelected in subs" :sub="subs[subSelected]" )
      h2( v-else ) 未选中订阅
          
      
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
  onDownloadError
} from "@/renderer/api";
import { remote } from "electron";
import bus from "./utils/EventBus";
import cache from "./utils/Cache";
import logger from "@/shared/logger";

const db = remote.getGlobal("db");

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
      subs: [],
      subSelected: -1,
      config: {},

      subsHash: {},
      tasksHash: {},
      submissionsHash: {},

      pause: false,
      downloading: false,
      downloadingList: [],
      downloadingItem: null
    };
  },

  async mounted() {
    // 初始化数据库
    // await db.initDatabase();

    // 初始化用户信息
    const user = cache.get("user");
    if (user) {
      this.user = user;
      await faLogin(user.a, user.b);
    }

    // 初始化订阅信息
    const subs = await db.subscription.getAll();
    this.subs = subs;
    for (const sub of subs) {
      // 缓存订阅信息
      this.$set(this.subsHash, sub.author.id, sub);

      // 缓存下载任务和作品
      const tasks = [...sub.galleryTasks, ...sub.scrapsTasks];
      for (const task of tasks) {
        if (task.gid) {
          this.$set(this.tasksHash, task.gid, task);
        }
        if (task.submission) {
          this.$set(this.submissionsHash, task.submission.id, task);
        }
      }
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

    // 初始化 aria2
    await initClient(this.config);

    onDownloadStart(this.onDownloadStart);
    onDownloadStop(this.onDownloadStop);
    onDownloadPause(this.onDownloadPause);
    onDownloadComplete(this.onDownloadComplete);
    onDownloadError(this.onDownloadError);

    // 全局事件绑定
    bus.$on("snackbar", this.showSnackBar);
    bus.$on("login", this.login);

    this.loading = false;
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

        this.subs.push(sub);
        this.$set(this.subsHash, sub.author.id, sub);
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

    async updateConfig(config) {
      // 更新设置
      this.config = { ...this.config, ...config };
      const ariaConfig = await db.ariaConfig.get();
      const userConfig = await db.userConfig.get();
      for (const key in config) {
        if (key in ariaConfig) {
          ariaConfig[key] = config[key];
        } else if (key in userConfig) {
          userConfig[key] = config[key];
        }
      }
      await db.ariaConfig.set(ariaConfig);
      await db.userConfig.set(userConfig);
    },

    async startAll() {
      if (this.downloading) {
        return;
      }

      if (this.subs.length === 0) {
        return;
      }

      this.pause = false;
      this.downloading = true;
      await resumeAllTask();
      this.downloadingList = this.subs;

      // 遍历所有的订阅
      for (
        this.downloadingItem = 0;
        this.downloadingItem < this.downloadingList.length && !this.pause;
        this.downloadingItem++
      ) {
        // 获取当前订阅
        const sub = this.downloadingList[this.downloadingItem];
        sub.status = "active";

        // 下载的图集
        const types = { gallery: sub.gallery, scraps: sub.scraps };

        for (const type in types) {
          if (!types[type]) {
            break;
          }

          // 遍历所有页
          for (let page = 1; !this.pause; page++) {
            let result = null;

            if (type === "gallery") {
              result = await faGallery(sub.author.id, page);
            } else {
              result = await faScraps(sub.author.id, page);
            }

            if (result === null) {
              // 下载失败
              logger.error("下载失败", type, page, sub);
              this.pause = true;
              break;
            }

            if (result.length === 0) {
              // 页数到头了
              logger.info("页数到头了", type, page, sub);
              break;
            }

            // 遍历此页上的所有项目
            for (let index = 0; index < result.length && !this.pause; index++) {
              const item = result[index];
              let submission;

              // 先判断缓存中有没有
              if (item.id in this.submissionsHash) {
                const task = this.submissionsHash[item.id];
                const skipList = ["active", "paused", "complete"];
                // 如果状态是活动中、暂停中或者已完成，就跳过此下载
                if (skipList.indexOf(task.status) !== -1) {
                  // TODO: 如果是已完成，应该查询本地是否有此文件
                  // 如果是已暂停，应该继续此任务
                  continue;
                }
              } else {
                // 没有的话再从网络下载
                submission = await faSubmission(item.id);
                if (submission === null) {
                  // 下载失败
                  logger.error("下载失败", type, page, index, sub);
                  this.pause = true;
                  break;
                }

                logger.info("新作品", type, page, index, submission);
              }

              // 添加下载任务
              const gid = await addUri({
                uris: [submission.downloadUrl],
                options: {
                  dir: sub[type + "Dir"]
                }
              });

              // 存储当前任务
              const task = { gid, submission };
              sub[type + "Tasks"].push(task);
              this.$set(this.tasksHash, gid, task);
              this.$set(this.submissionsHash, task.submission.id, task);
            }
          }
        }

        sub.status = "";
      }

      await pauseAllTask();
      this.pause = false;
      this.downloading = false;
    },

    pauseAll() {
      this.pause = true;
    },

    async saveSub(sub) {
      logger.log("保存", sub);
      await db.subscription.set(sub.author.id, sub);
    },

    async refreshTask(gid) {
      const item = await fetchTaskItem({ gid });
      if (gid in this.tasksHash) {
        const task = this.tasksHash[gid];
        this.$set(task, "status", item.status);
        await this.saveSub(this.subsHash[task.submission.author.id]);
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
    }
  }
};
</script>
