<template lang="pug">
  div( v-if="sub" class="sub-detail" )
    div( class="sub-detail-header" )
      User( :sub="sub" )
      el-button( type="text" icon="el-icon-arrow-down" @click="hideDetail" )

    el-row( type="flex" class="sub-detail-body" )
      //- Gallery
      el-col( :span="7" style="height: 100%; display: flex; flex-direction: column;" )
        div( class="sub-detail-card" )
          h3 Gallery
          div( class="sub-detail-card-body" )
            div
              span {{ $t("task.status.complete") }} {{ tasks.galleryComplete }}/{{ tasks.gallery }}
              el-progress( text-inside :percentage="galleryCompleteTasksPercent" :format="()=>''" )
            div {{ $t("task.status.active") }} {{ tasks.galleryActive }}/{{ tasks.gallery }}
              el-progress( text-inside :percentage="galleryActiveTasksPercent" :format="()=>''" )

      //- Scraps
      el-col( :span="7" style="height: 100%; display: flex; flex-direction: column;" )
        div( class="sub-detail-card" )
          h3 Scraps
          div( class="sub-detail-card-body" )
            div
              span {{ $t("task.status.complete") }} {{ tasks.scrapsComplete }}/{{ tasks.scraps }}
              el-progress( text-inside :percentage="scrapsCompleteTasksPercent" :format="()=>''" )
            div {{ $t("task.status.active") }} {{ tasks.scrapsActive }}/{{ tasks.scraps }}
              el-progress( text-inside :percentage="scrapsActiveTasksPercent" :format="()=>''" )

      //- 日志
      el-col( :span="10" style="height: 100%; display: flex; flex-direction: column;" )
        div( class="sub-detail-card" )
          h3 日志
          div( v-if="logs.length === 0" class="sub-detail-card-body" )
            span 暂无日志
          div( v-else class="sub-detail-card-body sub-detail-logs" )
            div(
              v-for="(log, index) in reverseLogs"
              :key="index"
              :class="typeToColor(log.type)"
            )
              span {{ formatLog(log) }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Subscription, Task, Log } from "@/main/database/entity";
import bus from "@/renderer/utils/EventBus";
import User from "../generic/User.vue";
import { TasksStatus } from "@/shared/interface";

@Component({
  components: { User }
})
export default class SubDetail extends Vue {
  @Prop(Object) sub!: Subscription;
  @Prop(Object) tasks!: TasksStatus;
  @Prop(Array) logs!: Log[];

  get galleryCompleteTasksPercent() {
    if (this.tasks.gallery === 0) {
      return 0;
    }
    return (this.tasks.galleryComplete / this.tasks.gallery) * 100;
  }

  get galleryActiveTasksPercent() {
    if (this.tasks.gallery === 0) {
      return 0;
    }
    return (this.tasks.galleryActive / this.tasks.gallery) * 100;
  }

  get scrapsCompleteTasksPercent() {
    if (this.tasks.scraps === 0) {
      return 0;
    }
    return (this.tasks.scrapsComplete / this.tasks.scraps) * 100;
  }

  get scrapsActiveTasksPercent() {
    if (this.tasks.scraps === 0) {
      return 0;
    }
    return (this.tasks.scrapsActive / this.tasks.scraps) * 100;
  }

  get reverseLogs() {
    return this.logs.reverse();
  }

  hideDetail() {
    bus.$emit("detail.hide");
  }

  typeToColor(type: string) {
    switch (type) {
      case "log": {
        return "white--text";
      }
      case "info": {
        return "white--text";
      }
      case "warning": {
        return "warning--text";
      }
      case "error": {
        return "error--text";
      }
      default: {
        return "white--text";
      }
    }
  }

  formatLog(log: Log) {
    const { message, createAt } = log;
    const date = new Date(createAt);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();

    const time = [hour, min, sec].join(":");
    return `[${time}] ${message}`;
  }
}
</script>

<style>
.sub-detail {
  height: 30vh;
  margin-top: 15px;
  display: flex;
  flex-direction: column;
}

.sub-detail .sub-detail-header {
  padding: 10px;
  background-color: #333;
  display: flex;
  align-items: center;
}

.sub-detail .sub-detail-body {
  background-color: #444;
  height: 100%;
}

.sub-detail .sub-detail-card {
  height: 100%;
  margin: 10px;
  background-color: #333;
  padding: 1px 15px;
  display: flex;
  flex-direction: column;
}

.sub-detail .sub-detail-card-body {
  height: 100%;
  overflow-y: auto;
}

.white--text {
  color: rgba(256, 256, 256, 0.87);
}

.warning--text {
  color: #e6a23c;
}

.error--text {
  color: #f56c6c;
}
</style>
