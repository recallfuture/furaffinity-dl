<template lang="pug">
v-navigation-drawer( app v-model="model" width="400" mobile-break-point="0" )
  v-toolbar
    v-toolbar-title {{ title }}
    v-spacer

    //- 全部开始/停止
    v-btn( v-if="!fetching" @click="startAll" icon ) 
      v-icon mdi-play
    v-btn( v-else @click="pauseAll" icon )
      v-icon mdi-pause
    v-spacer
    
    //- 添加订阅
    v-btn( @click="add" color="primary" rounded ) 添加订阅

  //- 订阅列表
  v-list( rounded )
    v-list-item-group( v-model="item" color="primary" )
      v-list-item( v-for="s in subs" :key="s.author.id"  )
        //- 作者头像
        v-list-item-avatar
          v-img( :src="s.author.avatar" )

        //- 作者名和状态
        v-list-item-content
          v-list-item-title {{ s.author.name }}
          v-list-item-subtitle( v-if="itemFetching(s)" ) 获取中
          v-list-item-subtitle( v-if="itemDownloading(s)" ) 下载中

        //- Gallery 和 Scraps 的标签
        v-list-item-action
          div
            v-chip( v-show="s.gallery" class="mr-2" color="info" ) G {{ s.galleryTasks.length }}
            v-chip( v-show="s.scraps" class="mr-2" color="warning" ) S {{ s.scrapsTasks.length }}
      

      
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Drawer",

  model: {
    prop: "drawer",
    event: "change"
  },

  props: {
    drawer: {
      type: Boolean,
      default: true
    },

    title: {
      type: String,
      default: ""
    },

    subs: {
      type: Array,
      default: () => []
    },

    fetching: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      model: this.drawer,
      item: -1
    };
  },

  methods: {
    itemFetching(sub) {
      return sub.status === "active";
    },

    itemDownloading(sub) {
      for (const task of sub.galleryTasks) {
        if (task.status === "active") {
          return true;
        }
      }
      for (const task of sub.scrapsTasks) {
        if (task.status === "active") {
          return true;
        }
      }
      return false;
    },

    add() {
      this.$emit("addSub:open");
    },

    startAll() {
      this.$emit("sub:startAll");
    },

    pauseAll() {
      this.$emit("sub:pauseAll");
    }
  },

  watch: {
    model(value) {
      this.$emit("change", value);
    },

    drawer(value) {
      this.model = value;
    },

    item(value) {
      this.$emit("sub:select", value);
    }
  }
};
</script>
