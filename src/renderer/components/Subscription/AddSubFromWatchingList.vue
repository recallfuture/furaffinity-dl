<template lang="pug">
  div( class="pa-4" )
    v-form( v-model="form" )
      //- 下载位置
      v-row
        v-col( cols="12" )
          dir-field( v-model="dir" label="订阅下载根目录" )
          span( class="grey--text" ) 将下载到此目录下对应的的作者名文件夹中
      
      //- Gallery 和 Scraps 选项
      v-row
        v-col( cols="6" )
          v-switch( v-model="gallery" label="Gallery" )

        v-col( cols="6" )
          v-switch( v-model="scraps" label="Scraps" )

    v-btn( @click="doFetch" color="primary" class="mt-4" :loading="loading" block ) 确定
</template>

<script>
import path from "path";
import fs from "fs";
import { convertNameToId } from "@/shared/utils";
import { faWatchingList } from "@/renderer/api";
import bus from "@/renderer/utils/EventBus";
import DirField from "../Form/DirField";
import User from "../Main/User";
import logger from "@/shared/logger";

export default {
  name: "AddSubFromWatchingList",

  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      loading: false,

      form: false,

      dir: this.config.dir,
      gallery: true,
      scraps: false
    };
  },

  components: {
    DirField,
    User
  },

  methods: {
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
    },

    // 验证其他选项
    async doFetch() {
      if (!this.form) {
        return;
      }

      this.loading = true;
      const users = await faWatchingList();

      const subs = users.map(user => {
        const baseDir = path.join(this.dir, user.id);
        const galleryDir = baseDir;
        const scrapsDir = path.join(baseDir, "scraps");

        return {
          id: user.id,
          name: user.name,
          url: user.url,
          avatar: user.avatar,
          gallery: this.gallery,
          scraps: this.scraps,
          dir: baseDir,
          galleryDir: galleryDir,
          scrapsDir: scrapsDir
        };
      });
      logger.log(subs);
      this.$emit("sub:new", subs);
      this.loading = false;
    }
  }
};
</script>
