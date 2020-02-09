<template lang="pug">
  div( class="toolbar" )
    //- 添加订阅
    el-button( type="primary" icon="el-icon-plus" @click="addDialog = true" ) {{ $t("header.add") }}

    //- 订阅下载控制
    el-button-group( style="margin-left: 10px; margin-right: 10px;" )
      el-button( type="info" icon="el-icon-video-play" @click="onStart" :disabled="fetching" ) {{ $t("header.start") }}
      el-button( type="info" icon="el-icon-video-pause" @click="onStop" :disabled="!fetching" ) {{ $t("header.stop") }}
      el-button( type="info" icon="el-icon-delete" @click="onDelete" :disabled="fetching" ) {{ $t("header.delete") }}
    
    div( class="spacer" )

    //- 用户登录后
    el-dropdown( v-if="user" @command="onCommand" )
      UserInfo( :sub="user" )
      
      el-dropdown-menu( slot="dropdown" )
        el-dropdown-item( command="logout" ) {{ $t("header.logout") }}

    //- 用户登录前
    el-button(
      v-else
      type="primary"
      icon="el-icon-user"
      @click="loginDialog= true"
    ) {{ $t("header.login") }}
    
    //- 设置
    el-button( type="info" icon="el-icon-setting" ) {{ $t("header.setting") }}

    //- 退出登录确认对话框
    el-dialog(
      :title="$t('header.logout_confirm_title')"
      :visible.sync="logoutConfirmDialog"
      width="30%"
    )
      h3 {{ $t("header.logout_confirm_content") }}
      span( slot="footer" class="dialog-footer" )
        el-button( @click="logoutConfirmDialog = false" ) {{ $t("generic.cancel") }}
        el-button( @click="logoutConfirmDialog = false; onLogout()" type="primary" ) {{ $t("generic.confirm") }}

    //- 登录对话框
    el-dialog(
      :title="$t('header.login')"
      :visible.sync="loginDialog"
      width="50%"
    )
      LoginForm( v-if="loginDialog" @success="onSuccess" )
    
    //- 添加订阅对话框
    el-dialog( :visible.sync="addDialog" width="50%" )
      AddSubForm( v-if="addDialog" )
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { User } from "@/renderer/interface";
import bus from "@/renderer/utils/EventBus";
import LoginForm from "../form/LoginForm.vue";
import AddSubForm from "../form/AddSubForm.vue";
import UserInfo from "../generic/User.vue";

@Component({
  components: { LoginForm, AddSubForm, UserInfo }
})
export default class Toolbar extends Vue {
  @Prop(Object) user!: User;
  @Prop(Boolean) fetching!: boolean;

  logoutConfirmDialog: boolean = false;
  loginDialog: boolean = false;
  addDialog: boolean = false;

  onStart() {
    bus.$emit("header.start");
  }

  onStop() {
    bus.$emit("header.stop");
  }

  onDelete() {
    bus.$emit("header.delete");
  }

  onSuccess(user: User) {
    this.loginDialog = false;
    this.onLogin(user);
  }

  onLogin(user: User) {
    bus.$emit("header.login", user);
  }

  onCommand(command: string) {
    if (command === "logout") {
      this.logoutConfirmDialog = true;
    }
  }

  onLogout() {
    bus.$emit("header.logout");
  }
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

.toolbar .el-dialog {
  background-color: #333;
}

.toolbar .el-dialog__title,
.toolbar .el-dialog__body {
  color: rgba(256, 256, 256, 0.87);
}
</style>
