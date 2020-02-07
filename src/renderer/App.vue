<template lang="pug">
  el-container( style="height: 100vh;" )
    el-header
      h1 下载器

    el-main
      sub-table()

    el-footer
      span @Furaffinity-dl
</template>

<script lang="ts">
import { Vue, Component, Prop, ProvideReactive } from "vue-property-decorator";
import { Subscription } from "@/main/database/entity";
import SubTable from "./components/subscription/SubTable.vue";
import { getSubs } from "./api/database";
import logger from "@/shared/logger";

@Component({
  components: { SubTable }
})
export default class App extends Vue {
  @ProvideReactive() subs: Subscription[] = [];

  async mounted() {
    this.subs = await getSubs();
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
  display: flex;
  align-items: center;
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
