<template lang="pug">
  div( class="speed-bar" )
    span( class="download-span" )
      i( class="el-icon-bottom" )
      span {{ downloadSpeed }}
    span( class="upload-span" )
      i( class="el-icon-top" )
      span {{ uploadSpeed }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Subscription } from "@/main/database/entity";
import { AriaStatus } from "../../interface";

@Component
export default class SpeedBar extends Vue {
  @Prop(Object) ariaStatus!: AriaStatus;

  get downloadSpeed() {
    return this.speedFormat(this.ariaStatus.downloadSpeed);
  }

  get uploadSpeed() {
    return this.speedFormat(this.ariaStatus.uploadSpeed);
  }

  speedFormat(speed: string) {
    const b = parseInt(speed, 10);
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (b === 0) {
      return "0 KB";
    }
    const i = Math.floor(Math.log(b) / Math.log(1024));
    if (i === 0) {
      return `${b} ${sizes[i]}`;
    }
    return `${(b / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  }
}
</script>

<style scoped>
.download-span {
  color: #f56c6c;
  margin-right: 10px;
}
.upload-span {
  color: #409eff;
}
</style>
