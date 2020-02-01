<template lang="pug">
  v-container
    v-btn( @click="clearLog" text block ) 清空日志
      
    template( v-if="logs.length > 0" )
      v-row( class="flex-column-reverse" dense )
        v-col( cols="12" v-for="(log, index) in logs" :key="index" :class="typeToColor(log.type) + '--text'" )
          span {{ formatLog(log) }}
    h2( v-else ) 暂无日志
</template>

<script>
import bus from "@/renderer/utils/EventBus";

export default {
  name: "DetailLogs",

  props: {
    title: {
      type: String,
      default: ""
    },

    sub: {
      type: Object,
      required: true
    },

    logs: {
      type: Array,
      required: true
    }
  },

  methods: {
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
    },

    clearLog() {
      bus.$emit("clearLog", this.sub.id);
    }
  }
};
</script>
