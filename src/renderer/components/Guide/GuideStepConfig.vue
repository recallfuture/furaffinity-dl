<template lang="pug">
div
  v-stepper-step( :complete="complete" :step="step" ) 默认设置

  v-stepper-content( :step="step" )
    v-form( v-model="valid" class="d-flex align-center" ref="form" )
      v-text-field( 
        v-model="dir" 
        prepend-icon="mdi-folder" 
        @click:prepend="openFolderDialog"
        label="默认存储位置"
        :rules="[() => checkFolder() || '文件夹不存在']"
        required
        validate-on-blur
      )
    
    v-btn( @click="save" color="primary" ) 完成
</template>

<script>
import fs from "fs";
import { openFolderDialog } from "@/renderer/api/ipc";

export default {
  name: "GuideStepConfig",

  data() {
    return {
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
    async openFolderDialog() {
      const paths = await openFolderDialog();
      if (paths && paths[0]) {
        this.dir = paths[0];
        this.$refs.form.validate();
      }
    },

    checkFolder() {
      return fs.existsSync(this.dir);
    },

    async save() {
      if (this.valid) {
        await this.$store.dispatch("config/saveAriaConfig", { dir: this.dir });
        this.$emit("next");
      }
    }
  }
};
</script>
