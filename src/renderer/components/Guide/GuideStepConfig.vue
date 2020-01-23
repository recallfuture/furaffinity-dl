<template lang="pug">
div
  v-stepper-step( :complete="complete" :step="step" ) 默认设置

  v-stepper-content( :step="step" )
    v-form( v-model="valid" class="d-flex align-center" ref="form" )
      dir-field( v-model="dir" label="默认下载位置" )
    
    v-btn( @click="submit" color="primary" ) 完成
</template>

<script>
import DirField from "../Form/DirField";
import fs from "fs";
import path from "path";
import bus from "@/renderer/utils/EventBus";

export default {
  name: "GuideStepConfig",

  data() {
    return {
      valid: false,
      dir: this.config.dir
    };
  },

  props: {
    config: {
      type: Object,
      default: () => ({})
    },

    complete: {
      type: Boolean,
      required: true
    },

    step: {
      type: String,
      required: true
    }
  },

  methods: {
    async submit() {
      if (this.valid) {
        if (!fs.existsSync(this.dir)) {
          bus.$emit("snackbar", { type: "error", message: "文件夹不存在" });
          return;
        }
        this.$emit("next", { dir: this.dir });
      }
    }
  },

  components: {
    DirField
  }
};
</script>
