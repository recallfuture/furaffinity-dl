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
import { getSubs } from "./api/database";
import logger from "@/shared/logger";
import { Author } from "furaffinity-api/dist/interfaces";

// 组件
import Toolbar from "./components/header/Toolbar.vue";
import SubTable from "./components/main/SubTable.vue";

@Component({
  components: { Toolbar, SubTable }
})
export default class App extends Vue {
  @ProvideReactive() subs: Subscription[] = [];

  user: Author | null = {
    id: "recallfuture",
    name: "recallfuture",
    url: "",
    avatar: "http://a.facdn.net/1496933393/recallfuture.gif"
  };

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
