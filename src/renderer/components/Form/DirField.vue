<template lang="pug">
v-text-field(
  v-model="selectedDir" 
  prepend-icon="mdi-folder"
  @click:prepend="openFolderDialog"
  :label="label"
  required
)
</template>

<script>
import { openFolderDialog } from "@/renderer/api/ipc";

export default {
  name: "DirField",

  model: {
    prop: "dir",
    event: "change"
  },

  props: {
    dir: {
      type: String,
      default: ""
    },

    label: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      selectedDir: this.dir
    };
  },

  watch: {
    dir(value) {
      this.selectedDir = value;
    },

    selectedDir(value) {
      this.$emit("change", value);
    }
  },

  methods: {
    async openFolderDialog() {
      const paths = await openFolderDialog();
      if (paths && paths[0]) {
        this.selectedDir = paths[0];
      }
    }
  }
};
</script>
