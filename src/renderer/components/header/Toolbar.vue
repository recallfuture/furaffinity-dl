<template lang="pug">
  div( class="toolbar" )
    //- 添加订阅
    el-button( type="primary" icon="el-icon-plus" ) {{ $t("header.add") }}

    //- 订阅下载控制
    el-button-group( style="margin-left: 10px; margin-right: 10px;" )
      el-button( type="info" icon="el-icon-video-play" ) {{ $t("header.start") }}
      el-button( type="info" icon="el-icon-video-pause" disabled ) {{ $t("header.stop") }}
      el-button( type="info" icon="el-icon-delete" ) {{ $t("header.delete") }}
    
    div( class="spacer" )

    //- 用户登录注销
    el-dropdown( v-if="user" )
      div( class="user" )
        el-avatar( class="avatar" :size="36" :src="user.avatar" )
        span {{ user.name }}
        i( class="el-icon-caret-bottom" )
      
      el-dropdown-menu( slot="dropdown" )
        el-dropdown-item {{ $t("header.logout") }}
    el-button( v-else type="primary" icon="el-icon-user" ) 登录FA
    
    //- 设置
    el-button( type="info" icon="el-icon-setting" ) {{ $t("header.setting") }}
</template>

<script lang="ts">
import { Vue, Component, Prop, ProvideReactive } from "vue-property-decorator";
import { User } from "@/renderer/interface";

@Component
export default class Toolbar extends Vue {
  @Prop(Object) user!: User;
}
</script>

<style>
.toolbar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
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
</style>
