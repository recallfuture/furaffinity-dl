<template lang="pug">
  v-dialog( v-model="model" width="400" )
    v-card
      v-card-title 确定注销？
      v-card-text( color="error" ) 注销后将无法获取大部分作品
      v-divider( light )
      v-card-actions
        v-spacer
        v-btn( @click="confirm" color="error" text ) 确定
        v-btn( @click="model = false" color="primary" text ) 取消
</template>

<script>
import bus from "@/renderer/utils/EventBus";

export default {
  name: "Logout",

  model: {
    prop: "dialog",
    event: "change"
  },

  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      model: this.dialog
    };
  },

  methods: {
    confirm() {
      bus.$emit("logout");
      this.model = false;
    }
  },

  watch: {
    model(value) {
      this.$emit("change", value);
    },

    dialog(value) {
      this.model = value;
    }
  }
};
</script>
