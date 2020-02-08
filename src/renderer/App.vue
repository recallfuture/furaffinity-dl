<template lang="pug">
  el-container( style="height: 100vh;" )
    el-header
      el-button( type="primary" icon="el-icon-plus" ) {{ $t("header.add") }}

      el-button-group( style="margin-left: 10px; margin-right: 10px;" )
        el-button( type="info" icon="el-icon-video-play" ) {{ $t("header.start") }}
        el-button( type="info" icon="el-icon-video-pause" disabled ) {{ $t("header.stop") }}
        el-button( type="info" icon="el-icon-delete" ) {{ $t("header.delete") }}
      
      div( class="spacer" )

      el-dropdown
        div( class="user" )
          el-avatar( v-if="user" class="avatar" :size="36" :src="user.avatar" )
          span( v-if="user" ) {{ user.name }}
          i( class="el-icon-caret-bottom" )
        el-dropdown-menu( slot="dropdown" )
          el-dropdown-item {{ $t("header.logout") }}
      
      el-button( type="info" icon="el-icon-setting" ) {{ $t("header.setting") }}

    el-main
      sub-table()

    el-footer
      span @Furaffinity-dl
</template>

<script lang="ts">
import { Vue, Component, Prop, ProvideReactive } from "vue-property-decorator";
import { Subscription } from "@/main/database/entity";
import SubTable from "./components/main/SubTable.vue";
import { getSubs } from "./api/database";
import logger from "@/shared/logger";
import { Author } from "furaffinity-api/dist/interfaces";

@Component({
  components: { SubTable }
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

.spacer {
  flex-grow: 1;
}

.user {
  color: rgba(256, 256, 256, 0.87);
  display: flex;
  align-items: center;
  margin-right: 10px;
  font-size: 1.1rem;
}

.user .avatar {
  margin-right: 5px;
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
