<template lang="pug">
  v-container( style="height: 100%; overflow-y: auto;" )
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
                :key="task.id"
              )
                template( v-slot:activator="{ on }" )
                  v-card(
                    v-on="on"
                    :color="statusToColor(task.status)"
                    width="20"
                    height="20"
                    class="ma-1"
                  )
                p 作品标题：{{ task.title }}
                p 文件路径：{{ task.path }}
                p 状态：{{ task.status }}

        v-card( v-if="sub.scraps" )
          v-card-title Scraps
          
          v-divider( light)

          v-container( fluid )
            v-row
              v-tooltip(
                top
                v-for="task in sub.scrapsTasks"
                :key="task.id"
              )
                template( v-slot:activator="{ on }" )
                  v-card(
                    v-on="on"
                    :color="statusToColor(task.status)"
                    width="20"
                    height="20"
                    class="ma-1"
                  )
                p 作品标题：{{ task.title }}
                p 文件路径：{{ task.path }}
                p 状态：{{ task.status }}
              
      //- 日志
      v-tab-item
        v-container
          template( v-if="sub.log.length > 0" )
            v-row( class="flex-column-reverse"  )
              v-col( cols="12" v-for="(log, index) in sub.log" :key="index" :class="typeToColor(log.type) + '--text'" )
                span {{ formatLog(log) }}
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
    },

    typeToColor(type) {
      switch (type) {
        case "log": {
          return "white";
        }
        case "info": {
          return "white";
        }
        case "warning": {
          return "warning";
        }
        case "error": {
          return "error";
        }
        default: {
          return "white";
        }
      }
    },

    formatLog(log) {
      const { text, timestamp } = log;
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDay();
      const hour = date.getHours();
      const min = date.getMinutes();
      const sec = date.getSeconds();

      const time = [hour, min, sec].join(":");
      return `[${time}] ${text}`;
    }
  },

  components: {
    User
  }
};
</script>
