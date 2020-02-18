<template lang="pug">
  span( class="timer" :class="isActive ? 'active' : ''" )
    i( class="el-icon-timer" )
    span {{ hours }}:{{ minutes }}:{{ seconds }}
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import bus from "@/renderer/utils/EventBus";

@Component
export default class Timer extends Vue {
  isActive: boolean = false;
  time: number = 0;
  startTime: number = 0;
  updater: any = null;

  get seconds() {
    const value = Math.floor((this.time / 1000) % 60);
    if (value < 10) {
      return "0" + value;
    } else {
      return value.toString();
    }
  }

  get minutes() {
    const value = Math.floor((this.time / 1000 / 60) % 60);
    if (value < 10) {
      return "0" + value;
    } else {
      return value.toString();
    }
  }

  get hours() {
    const value = Math.floor(this.time / 1000 / 60 / 60);
    if (value < 10) {
      return "0" + value;
    } else {
      return value.toString();
    }
  }

  mounted() {
    bus.$on("fetch.start", this.start);
    bus.$on("fetch.stop", this.stop);
  }

  start() {
    this.stop();
    this.clear();
    this.isActive = true;
    this.startTime = new Date().getTime();
    this.updater = setInterval(() => (this.time = new Date().getTime() - this.startTime), 10);
  }

  stop() {
    this.isActive = false;
    clearInterval(this.updater);
  }

  clear() {
    this.time = 0;
  }
}
</script>

<style scoped>
.active {
  color: #409eff;
}
</style>
