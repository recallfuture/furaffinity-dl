<template lang="pug">
  v-container
    v-tabs( centered )
      v-tab 基本信息
      v-tab 下载详情
      v-tab 日志

      //- 基本信息
      v-tab-item
        v-card(  )
          v-card-title
            user( :user="sub.author" )

          v-divider( light)
          
          v-list(  )
            v-list-item
              span 作者名：{{ sub.author.name }}
            v-list-item
              span 作者主页：{{ sub.author.url }}
            v-list-item
              span 本地目录：{{ sub.dir }}
            //- v-list-item( v-if="sub.gallery" )
            //-   span( class="text-no-wrap" ) Gallery下载进度：
            //-   v-progress-linear( :value="sub.galleryTasks.length" )
            //- v-list-item( v-if="sub.scraps" )
            //-   span( class="text-no-wrap" ) Scraps下载进度：
            //-   v-progress-linear( :value="sub.scrapsTasks.length" )

      //- 下载详情
      v-tab-item
        v-card( v-if="sub.gallery" )
          v-card-title Gallery
          
          v-divider( light)

          v-container( fluid )
            v-row
              v-tooltip(
                top
                v-for="task in sub.galleryTasks"
                :key="task.submission.id"
              )
                template( v-slot:activator="{ on }" )
                  v-card(
                    v-on="on"
                    :color="statusToColor(task.status)"
                    width="20"
                    height="20"
                    class="ma-1"
                  )
                p 作品标题：{{ task.submission.title }}
                p 状态：{{ task.status }}

        v-card( v-if="sub.scraps" )
          v-card-title Scraps
          
          v-divider( light)

          v-container( fluid )
            v-row
              v-tooltip(
                top
                v-for="task in sub.scrapsTasks"
                :key="task.submission.id"
              )
                template( v-slot:activator="{ on }" )
                  v-card(
                    v-on="on"
                    :color="statusToColor(task.status)"
                    width="20"
                    height="20"
                    class="ma-1"
                  )
                p 作品标题：{{ task.submission.title }}
                p 状态：{{ task.status }}
              
      //- 日志
      v-tab-item
        v-container( class="px-4" )
          template( v-if="sub.log.length > 0" )
            div( v-for="(log, index) in sub.log" :key="index") {{ log }}
          h2( v-else ) 暂无日志
        
</template>

<script>
import User from "@/renderer/components/Main/User";
import logger from "@/shared/logger";

export default {
  name: "Detail",

  props: {
    sub: {
      type: Object,
      required: true
    }
  },

  data() {
    return {};
  },

  methods: {
    statusToColor(status) {
      switch (status) {
        case "active": {
          return "accent";
        }
        case "complete": {
          return "primary";
        }
        case "paused": {
          return "info";
        }
        case "error": {
          return "error";
        }
        default: {
          return "white";
        }
      }
    }
  },

  components: {
    User
  }
};
</script>
