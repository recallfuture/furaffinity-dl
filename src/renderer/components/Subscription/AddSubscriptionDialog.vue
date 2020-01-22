<template lang="pug">
v-dialog( v-model="model" width="800" )
  div( class="gray pa-6" )
    v-tabs( v-model="tab" grow )
      v-tab 添加一个订阅
      v-tab 从关注列表导入

      v-tab-item
        AddSingleSubscription
      v-tab-item
        v-container
          h2 敬请期待
    
</template>

<script>
import AddSingleSubscription from "./AddSingleSubscription";

export default {
  name: "AddSubscription",

  data() {
    return {
      tab: true
    };
  },

  components: {
    AddSingleSubscription
  },

  computed: {
    model: {
      get() {
        return this.$store.state.app.addSubscriptionDialog;
      },

      set(value) {
        this.$store.commit("app/TOGGLE_ADD_SUBSCRIPTION_DIALOG", value);
      }
    }
  }
};
</script>
