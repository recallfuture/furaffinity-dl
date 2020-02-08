<template lang="pug">
  el-container( style="height: 100vh;" )
    el-header
      Toolbar( :user="user" )

    el-main
      sub-table()

    el-footer
      span @Furaffinity-dl
</template>

<script lang="ts">
import { Vue, Component, Prop, ProvideReactive } from "vue-property-decorator";
import { Subscription } from "@/main/database/entity";
import logger from "@/shared/logger";
import { User } from "./interface";
import cache from "@/renderer/utils/Cache";
import { faLogin, getSubs } from "./api";

// 组件
import Toolbar from "./components/header/Toolbar.vue";
import SubTable from "./components/main/SubTable.vue";

@Component({
  components: { Toolbar, SubTable }
})
export default class App extends Vue {
  @ProvideReactive() subs: Subscription[] = [];

  user: User | null = null;

  async mounted() {
    await this.initUser();
    await this.initSubs();
  }

  /**
   * 初始化用户信息
   */
  async initUser() {
    const user: User = cache.get("user");
    if (user) {
      this.user = user;
      await faLogin(user.a, user.b);
    }
  }

  /**
   * 初始化订阅列表
   */
  async initSubs() {
    const subs = await getSubs();
    for (const sub of subs) {
      sub.status = "";
      this.subs.push(sub);
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

.el-scrollbar__wrap {
  overflow-x: hidden !important;
}

.el-header {
  background-color: #121212;
  color: rgba(256, 256, 256, 0.87);
}

.el-main {
  background-color: #222;
  color: rgba(256, 256, 256, 0.87);
}

.el-footer {
  background-color: #131313;
  display: flex;
  align-items: center;
  color: rgba(256, 256, 256, 0.6);
}
</style>
