<template lang="pug">
div( class="pa-4" )
  //- 错误提示
  v-alert( v-model="alert" dismissible type="error" ) {{ errorMessage }}

  v-window( v-model="window" )
    //- 用户名
    v-window-item
      v-form( v-model="validUsername" )
        v-text-field( v-model="username" :rules="usernameRules" label="用户名" required )
    
    //- 其他选项
    v-window-item
      v-form( v-model="validOptions" )
        div( v-if="user" )
          v-avatar( size="36" tile class="mb-4" )
            img( :src="user.avatar" )
          span( class="ml-2" ) {{ user.name }}

        v-row
          v-col( cols="12" )
              dir-field( v-model="dir" label="下载位置" )
        
        v-row
          v-col( cols="6" )
            v-switch( v-model="gallery" label="Gallery" )
            span( v-show="gallery" class="text-break" ) 下载到： {{ getFullPath(galleryDir) }}

          v-col( cols="6" )
            v-switch( v-model="scraps" label="Scraps" )
            span( v-show="scraps" class="text-break" ) 下载到： {{ getFullPath(scrapsDir) }}

    v-btn( @click="next" color="primary" class="mt-4" :loading="loading" block ) 确定
</template>

<script>
import DirField from "../Form/DirField";
import { faAuthor } from "@/renderer/api";
import path from "path";
import fs from "fs";
import db from "@/shared/database";

export default {
  name: "AddSingleSubscription",

  data() {
    return {
      alert: false,
      errorMessage: "",

      window: 0,
      loading: false,

      validUsername: false,
      validOptions: false,

      username: "",
      user: null,

      dir: this.$store.state.config.ariaConfig.dir,
      gallery: true,
      scraps: false,
      galleryDir: "",
      scrapsDir: "scraps"
    };
  },

  components: {
    DirField
  },

  computed: {
    usernameRules() {
      return [
        () =>
          !!/^[a-zA-Z0-9-_~.]+$/.exec(this.username) ||
          "用户名包含无效字符，仅允许使用字母和数字，破折号，下划线，波浪号和句点。"
      ];
    }
  },

  methods: {
    getFullPath(dir) {
      return path.join(this.dir, dir);
    },

    convertNameToId(name) {
      return name.replace("-", "_");
    },

    craeteFolder(dir) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    },

    // 验证用户名
    async doValidUsername() {
      if (!this.validUsername) {
        return;
      }

      try {
        // 开始获取用户信息
        this.loading = true;
        this.user = await faAuthor(this.convertNameToId(this.username));
        console.log(this.user);

        // 使用用户 id 作为主文件夹
        this.dir = path.join(this.dir, this.user.id);
        this.window++;
      } catch (e) {
        console.log(e);

        // 显示错误信息
        this.alert = true;
        this.errorMessage = "获取用户信息失败";
      } finally {
        this.loading = false;
      }
    },

    // 验证其他选项
    async doValidOptions() {
      if (!this.validOptions) {
        return;
      }

      this.loading = true;
      const subscription = {
        author: this.user,
        gallery: this.gallery,
        scraps: this.scraps,
        galleryTasks: [],
        scrapsTasks: [],
        dir: this.dir,
        galleryDir: this.getFullPath(this.galleryDir),
        scrapsDir: this.getFullPath(this.scrapsDir),
        log: [],
        status: "created",
        updateOnly: false,
        createAt: Date.parse(new Date()),
        deleted: false
      };
      console.log(subscription);
      // 存入数据库
      try {
        await this.$store.dispatch("subscription/add", subscription);
        this.$store.commit("app/TOGGLE_ADD_SUBSCRIPTION_DIALOG", false);
      } catch (e) {
        console.log(e);
        this.alert = true;
        this.errorMessage = `保存失败：${e.message}`;
      } finally {
        this.loading = false;
      }
    },

    next() {
      if (this.loading) {
        return;
      }

      if (this.window === 0) {
        this.doValidUsername();
      } else {
        this.doValidOptions();
      }
    }
  }
};
</script>
