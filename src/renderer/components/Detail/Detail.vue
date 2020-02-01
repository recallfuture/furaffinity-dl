<template lang="pug">
  v-container( style="height: 100%; overflow-y: auto; overflow-x: hidden;" )
    v-tabs( centered )
      v-tab 基本信息
      v-tab 下载详情
      v-tab 日志

      //- 基本信息
      v-tab-item
        detail-basic( :sub="sub" )

      //- 下载详情
      v-tab-item
        detail-tasks( title="Gallery" v-if="sub.gallery" :tasks="galleryTasks" )
        detail-tasks( title="Scraps" v-if="sub.scraps" :tasks="scrapsTasks" )

      //- 日志
      v-tab-item
        detail-logs( :sub="sub" :logs="logs" )
        
</template>

<script>
import DetailBasic from "./DetailBasic";
import DetailTasks from "./DetailTasks";
import DetailLogs from "./DetailLogs";
import logger from "@/shared/logger";

export default {
  name: "Detail",

  props: {
    sub: {
      type: Object,
      required: true
    },

    galleryTasks: {
      type: Array,
      required: true
    },

    scrapsTasks: {
      type: Array,
      required: true
    },

    logs: {
      type: Array,
      required: true
    }
  },

  components: {
    DetailBasic,
    DetailTasks,
    DetailLogs
  }
};
</script>
