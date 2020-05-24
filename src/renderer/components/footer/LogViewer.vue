<template lang="pug">
  div( class='log' )
    span( @click="dialog = true" ) {{ lastLog }}

    el-dialog(
      title="日志"
      :visible.sync="dialog"
      width="600px"
    )
      div 日志等级：
        el-checkbox( v-model="levelLog" ) log
        el-checkbox( v-model="levelError" ) error

      div( style="max-height: 60vh; overflow: auto;" )
        p( v-for="(log, index) in reverseLogs" :key="index" :class="typeToColor(log.type)") {{ formatLog(log) }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Log, LogType } from "@/main/database/entity";

@Component
export default class LogViewer extends Vue {
  @Prop() logs!: Log[];

  dialog: Boolean = false;

  levelLog: Boolean = true;
  levelError: Boolean = true;

  get lastLog() {
    // TODO: i18n
    return this.logs.length > 0 ? this.logs[0].message : "暂无日志";
  }

  get reverseLogs() {
    return this.logs.reverse().filter(log => {
      if (log.type === LogType.Log) {
        return this.levelLog;
      }

      if (log.type === LogType.Error) {
        return this.levelError;
      }

      return true;
    });
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

  addPrefix(number: Number) {
    if (number < 10) {
      return "0" + number;
    } else {
      return "" + number;
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

    const time = `${this.addPrefix(hour)}:${this.addPrefix(
      min
    )}:${this.addPrefix(sec)}`;
    return `[${time}] ${message}`;
  }
}
</script>

<style>
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
