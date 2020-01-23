<template lang="pug">
v-dialog( v-model="model" key="AddSubscriptionDialog" width="800" )
  div( class="primary" )
    v-tabs( v-model="tab" v-if="model" grow )
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
  name: "AddSubscriptionDialog",

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
