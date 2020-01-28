<template lang="pug">
v-dialog( v-model="model" width="800" )
  div( class="primary" )
    v-tabs( v-model="tab" v-if="model" grow )
      v-tab 添加一个订阅
      v-tab 从关注列表导入

      v-tab-item
        add-single-sub( :config="config" :subs="subs" @sub:new="newSubs" )
      v-tab-item
        add-sub-from-watching-list( :config="config" @sub:new="newSubs" )
    
</template>

<script>
import AddSingleSub from "./AddSingleSub";
import AddSubFromWatchingList from "./AddSubFromWatchingList";
import bus from "@/renderer/utils/EventBus";
import logger from "../../../shared/logger";

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
    AddSingleSub,
    AddSubFromWatchingList
  },

  methods: {
    newSubs(subs) {
      this.$emit("subs:new", subs);
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
