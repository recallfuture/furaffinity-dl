<template lang="pug">
div
  v-stepper-step( :complete="complete" :step="step" ) 默认设置

  v-stepper-content( :step="step" )
    v-form( v-model="valid" class="d-flex align-center" ref="form" )
      //- 错误提示
      v-alert( v-model="alert" dismissible type="error" ) {{ errorMessage }}
      dir-field( v-model="dir" label="默认下载位置" )
    
    v-btn( @click="save" color="primary" ) 完成
</template>

<script>
import DirField from "../Form/DirField";
import fs from "fs";
import path from "path";

export default {
  name: "GuideStepConfig",

  data() {
    return {
      alert: false,
      errorMessage: "",

      valid: false,
      dir: this.$store.state.config.ariaConfig.dir
    };
  },

  props: {
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
    async save() {
      if (this.valid) {
        if (!this.craeteFolder(this.dir)) {
          return;
        }

        await this.$store.dispatch("config/saveAriaConfig", { dir: this.dir });
        this.$emit("next");
      }
    },

    craeteFolder(dir) {
      try {
        if (!path.isAbsolute(dir)) {
          this.alert = true;
          this.errorMessage = "请提供绝对路径";
          return false;
        }
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
      } catch (e) {
        console.log(e);
        this.alert = true;
        this.errorMessage = "路径错误，请尝试使用其他路径";
        return false;
      }
      return true;
    }
  },

  components: {
    DirField
  }
};
</script>
