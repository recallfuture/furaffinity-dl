<template lang="pug">
v-dialog( v-model="model" width="800" )
  div( class="primary" )
    v-tabs( v-model="tab" v-if="model" grow )
      v-tab 添加一个订阅
      v-tab 从关注列表导入

      v-tab-item
        //- TODO: 参数
        add-single-sub( :config="config" :subs="subs" @sub:new="newSub" )
      v-tab-item
        v-container
          h2 敬请期待
    
</template>

<script>
import AddSingleSub from "./AddSingleSub";
import bus from "@/renderer/utils/EventBus";

export default {
  name: "AddSubDialog",

  model: {
    prop: "dialog",
    event: "change"
  },

  props: {
    dialog: {
      type: Boolean,
      default: true
    },

    subs: {
      type: Object,
      default: () => ({})
    },

    config: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      model: this.dialog,
      tab: 0
    };
  },

  components: {
    AddSingleSub
  },

  methods: {
    newSub(sub) {
      this.$emit("addSub:open", [sub]);
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
