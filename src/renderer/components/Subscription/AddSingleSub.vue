<template lang="pug">
div( class="pa-4" )
  v-window( v-model="window" )
    //- 用户名
    v-window-item
      v-form( v-model="validUsername" )
        v-text-field( v-model="username" :rules="usernameRules" label="用户名" required )
    
    //- 其他选项
    v-window-item
      v-form( v-model="validOptions" )
        //- 显示用户
        v-row( v-if="user" )
          v-col( cols="12" )
            user( v-model="user" )

        //- 下载位置
        v-row
          v-col( cols="12" )
            dir-field( v-model="dir" label="下载位置" )
        
        //- Gallery 和 Scraps 选项
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
import path from "path";
import fs from "fs";
import { convertNameToId } from "@/shared/utils";
import { faAuthor } from "@/renderer/api";
import bus from "@/renderer/utils/EventBus";
import DirField from "../Form/DirField";
import User from "../Main/User";

export default {
  name: "AddSingleSub",

  props: {
    subs: {
      type: Object,
      default: () => ({})
    },

    config: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      window: 0,
      loading: false,

      validUsername: false,
      validOptions: false,

      username: "",
      user: null,

      dir: this.config.dir,
      gallery: true,
      scraps: false,
      galleryDir: "",
      scrapsDir: "scraps"
    };
  },

  components: {
    DirField,
    User
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

    convertNameToId,

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

      // 开始获取用户信息
      this.loading = true;
      const user = await faAuthor(this.convertNameToId(this.username));
      console.log(user);

      if (!user) {
        bus.$emit("snackbar", { type: "error", message: "用户信息获取失败" });
        this.loading = false;
        return;
      }

      console.log(user.id);
      console.log(this.subs);
      if (user.id in this.subs) {
        bus.$emit("snackbar", { type: "error", message: "用户已存在" });
        this.loading = false;
        return;
      }

      this.user = user;
      this.loading = false;
      // 使用用户 id 作为主文件夹
      this.dir = path.join(this.dir, user.id);
      // 切换到其他选项填写页
      this.window++;
    },

    // 验证其他选项
    async doValidOptions() {
      if (!this.validOptions) {
        return;
      }

      this.loading = true;
      const sub = {
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
      console.log(sub);
      this.$emit("sub:new", sub);
      this.loading = false;
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
