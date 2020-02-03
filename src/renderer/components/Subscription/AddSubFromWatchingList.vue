<template lang="pug">
  div( class="pa-4" )
    v-form( v-model="form" )
      //- 下载位置
      v-row
        v-col( cols="12" )
          dir-field( v-model="dir" label="订阅下载根目录" )
        v-col( cols="3" )
          v-container( fill-height )
            span 订阅文件夹名格式：
        v-col( cols="3" )
          v-text-field( v-model="prefix" label="前缀" )
        v-col( cols="3" )
          v-select( v-model="dirName" :items="dirItems" label="订阅文件夹名" )
        v-col( cols="3" )
          v-text-field( v-model="suffix" label="后缀" )
        v-col( cols="12" )
          span 例如，一个用户名为Furry，id为furry的订阅，将存储到 {{ getPath({id: "furry", name: "Furry"}) }}
      
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
import _ from "lodash";
import { convertNameToId } from "@/shared/utils";
import { faWatchingList } from "@/renderer/api";
import bus from "@/renderer/utils/EventBus";
import DirField from "../Form/DirField";
import User from "../Main/User";
import logger from "@/shared/logger";
import { Subscription } from "../../../main/database/entity";

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
      scraps: false,

      advanced: false,
      prefix: "",
      dirName: "作者id",
      dirItems: [
        { text: "作者id" },
        { text: "作者名" },
        { text: "作者id，首字母大写" },
        { text: "作者名，首字母大写" }
      ],
      suffix: ""
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

    getPath(user) {
      let baseName;
      switch (this.dirName) {
        case "作者名": {
          baseName = this.prefix.trim() + user.name + this.suffix.trim();
          break;
        }
        case "作者id，首字母大写": {
          baseName =
            this.prefix.trim() + _.upperFirst(user.id) + this.suffix.trim();
          break;
        }
        case "作者名，首字母大写": {
          baseName =
            this.prefix.trim() + _.upperFirst(user.name) + this.suffix.trim();
          break;
        }
        default: {
          // 作者id
          baseName = this.prefix.trim() + user.id + this.suffix.trim();
          break;
        }
      }
      return path.join(this.dir, baseName);
    },

    // 验证其他选项
    async doFetch() {
      if (!this.form) {
        return;
      }

      this.loading = true;
      const users = await faWatchingList();

      const subs = users.map(user => {
        const baseDir = this.getPath(user);
        const galleryDir = baseDir;
        const scrapsDir = path.join(baseDir, "scraps");
        const sub = new Subscription();

        sub.id = user.id;
        sub.name = user.name;
        sub.url = user.url;
        sub.avatar = user.avatar;
        sub.gallery = this.gallery;
        sub.scraps = this.scraps;
        sub.dir = baseDir;
        sub.galleryDir = galleryDir;
        sub.scrapsDir = scrapsDir;

        return sub;
      });
      this.$emit("sub:new", subs);
      this.loading = false;
    }
  }
};
</script>
