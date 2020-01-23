<template lang="pug">
v-app
  //- 全局使用的组件
  guide
  add-subscription-dialog

  //- 订阅抽屉栏
  Drawer

  //- 订阅详情控制栏
  app-bar
  v-content( class="grey lighten-5" )
</template>

<script>
// @ is an alias to /src
import Guide from "@/renderer/components/Guide/Guide";
import AddSubscriptionDialog from "@/renderer/components/Subscription/AddSubscriptionDialog";
import AppBar from "@/renderer/components/Main/AppBar";
import Drawer from "@/renderer/components/Main/Drawer";
import { app } from "electron";

export default {
  name: "home",

  data() {
    return {};
  },

  components: {
    Guide,
    AddSubscriptionDialog,
    AppBar,
    Drawer
  }
};
</script>
