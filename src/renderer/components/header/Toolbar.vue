<template lang="pug">
  div( class="toolbar" )
    //- 添加订阅
    el-button( type="primary" icon="el-icon-plus" @click="addDialog = true" ) {{ $t("header.add") }}

    //- 订阅下载控制
    el-button-group( style="margin-left: 10px; margin-right: 10px;" )
      el-button( type="info" icon="el-icon-video-play" @click="onStart" :disabled="downloading" ) {{ $t("header.start") }}
      el-button( type="info" icon="el-icon-video-pause" @click="onStop" :disabled="!downloading" ) {{ $t("header.stop") }}
      el-button( type="info" icon="el-icon-delete" @click="onDelete" :disabled="downloading" ) {{ $t("header.delete") }}
    
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
      width="600px"
    )
      LoginForm( v-if="loginDialog" @success="onSuccess" )
    
    //- 添加订阅对话框
    el-dialog( :visible.sync="addDialog" width="600px" )
      AddSubForm( v-if="addDialog" )

    //- TODO: i18n
    el-dialog(
      :visible.sync="deleteDialog"
      :before-close="() => {}"
      width="400px"
      title="确定删除这些订阅吗？"
      :show-close="false"
    )
      span( v-if="!!deleteStatus" ) 删除中 {{ deleteStatus.current }}/{{ deleteStatus.total }}
      el-checkbox( v-else v-model="deleteWithTrash" style="color: white;" ) 同时将订阅文件夹放入回收站
      span( slot="footer" class="dialog-footer" )
        el-button( @click="deleteDialog = false" :disabled="!!deleteStatus" ) 取消
        el-button( @click="doDelete" type="primary" :loading="!!deleteStatus" ) 确定
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { User } from "@/shared/interface";
import bus from "@/renderer/utils/EventBus";
import LoginForm from "../form/LoginForm.vue";
import AddSubForm from "../form/AddSubForm.vue";
import UserInfo from "../generic/User.vue";
import { Subscription } from "@/main/database/entity";
import { removeSub } from "../../api";
import trash from "trash";
import logger from "@/shared/logger";

@Component({
  components: { LoginForm, AddSubForm, UserInfo }
})
export default class Toolbar extends Vue {
  @Prop(Object) user!: User;
  @Prop(Boolean) downloading!: boolean;

  logoutConfirmDialog: boolean = false;
  loginDialog: boolean = false;
  addDialog: boolean = false;
  deleteDialog: boolean = false;
  deleteWithTrash: boolean = false;

  deleteStatus: any = null;
  willDeleteSubs: Subscription[] = [];

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

  mounted() {
    bus.$on("sub.delete", this.handleSubDelete);
  }

  handleSubDelete(subs: Subscription[]) {
    // TODO: i18n
    if (subs.length === 0) {
      this.$message.warning("请先选择要删除的订阅");
      return;
    }
    this.willDeleteSubs = subs;
    this.deleteDialog = true;
  }

  async doDelete() {
    let current = 0;
    const total = this.willDeleteSubs.length;
    for (const sub of this.willDeleteSubs) {
      current++;
      this.deleteStatus = { current, total };
      try {
        await removeSub(sub.id);
        if (this.deleteWithTrash) {
          await trash(sub.dir);
        }
      } catch (e) {
        logger.error(e);
      }
    }
    this.deleteStatus = null;
    this.deleteDialog = false;
    bus.$emit("sub.deleted", this.willDeleteSubs);
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
