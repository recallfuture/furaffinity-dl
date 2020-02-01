<template lang="pug">
  v-navigation-drawer( app v-model="model" color="#2d323c" width="400" mobile-break-point="0" )
    div( class="d-flex flex-column" style="height: 100%" )
      v-toolbar( color="#2d323c" )
        v-toolbar-title {{ title }}
        v-spacer

        //- 全部开始/停止
        v-btn( @click="startAll" icon ) 
          v-icon mdi-play
        v-btn( @click="pauseAll" icon )
          v-icon mdi-stop
        v-btn( @click="openDeleteSubDialog" icon )
          v-icon mdi-close

        v-dialog( v-model="deleteSubDialog" width="400" )
          v-card(  )
            v-card-title 删除订阅
            v-card-text( v-if="deleteSubDialog" )
              h3 确定删除 {{ subs[item].name }} 的订阅?
              v-checkbox( v-model="deleteFiles" :label="`同时删除订阅文件夹（${subs[item].dir}）`" )
            v-card-actions
              v-spacer
              v-btn( @click="deleteOne" color="error" text ) 确定
              v-btn( @click="deleteSubDialog = false" color="primary" text ) 取消

        v-spacer
        //- 添加订阅
        v-btn( @click="add" color="primary" rounded ) 添加订阅

      //- 订阅列表
      v-list( rounded style="height: 100%; overflow-y: auto;" )
        v-list-item-group( v-model="item" color="primary" )
          v-list-item( v-for="(s, index) in subs" :key="index" )
            //- 作者头像
            v-list-item-avatar
              v-img( :src="s.avatar" )

            //- 作者名和状态
            v-list-item-content
              v-list-item-title {{ s.name }}
              v-list-item-subtitle( v-if="itemFetching(s)" ) 获取中
              v-list-item-subtitle( v-else-if="itemError(s)" color="error" ) 获取失败
              //- v-list-item-subtitle( v-if="itemDownloading(s)" ) 下载中

            //- Gallery 和 Scraps 的标签
            v-list-item-action
              div
                v-chip( v-show="s.gallery" class="mr-2" color="info" ) G {{ s.galleryTaskNum }}
                v-chip( v-show="s.scraps" class="mr-2" color="warning" ) S {{ s.scrapsTaskNum }}
          v-list-item( v-if="subs.length === 0" )
            v-list-item-content
              v-list-item-title 暂无订阅，请点击上方添加订阅
</template>

<script>
import { mapState } from "vuex";
import bus from "@/renderer/utils/EventBus";

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
      item: undefined,
      deleteSubDialog: false,
      deleteFiles: false
    };
  },

  methods: {
    itemFetching(sub) {
      return sub.status === "active";
    },

    itemError(sub) {
      return sub.status === "error";
    },

    add() {
      this.$emit("addSub:open");
    },

    startAll() {
      this.$emit("sub:startAll");
    },

    pauseAll() {
      this.$emit("sub:pauseAll");
    },

    openDeleteSubDialog() {
      if (this.item in this.subs) {
        this.deleteSubDialog = true;
      } else {
        bus.$emit("snackbar", {
          type: "warning",
          message: "请先选中一个订阅"
        });
      }
    },

    deleteOne() {
      this.$emit("sub:delete", this.item, { deleteFiles: this.deleteFiles });
      this.deleteSubDialog = false;
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
