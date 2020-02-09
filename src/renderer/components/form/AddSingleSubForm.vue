<template lang="pug">
  el-form(
    :rules="rules"
    :model="form"
    @submit.native.prevent="submit"
    ref="addSingleSubForm"
    status-icon
    label-width="110px"
  )
    //-  Step 1
    el-form-item( v-if="step === 1" :label="$t('header.tab_add_single.username')" prop="username" )
      el-input( v-model="form.username" autofocus )
    el-form-item( v-if="step === 1" )
      el-button( type="primary" @click="submit" :loading="loading" ) {{ $t("header.tab_add_single.next") }}

    //- Step 2
    el-form-item( v-if="step === 2" )
      el-avatar( :size="36" :src="user.avatar" class="mr-4" )
      span( class="text-large" ) {{ user.name }}
    
    el-form-item( v-if="step === 2" :label="$t('header.tab_add_single.save_to')" prop="dir" )
      el-input( v-model="form.dir" autofocus )
        el-button( slot="prepend" icon="el-icon-folder" @click="choseDir" )

    el-form-item( v-if="step === 2" label="Gallery" )
      el-switch( v-model="form.gallery" class="mr-4" )
      span( v-if="form.gallery" class="text-large" ) {{ galleryPath }}

    el-form-item( v-if="step === 2" label="Scraps" )
      el-switch( v-model="form.scraps" class="mr-4" )
      span( v-if="form.scraps" class="text-large" ) {{ scrapsPath }}
      
    el-form-item( v-if="step === 2" )
      el-button( type="primary" @click="submit" ) {{ $t("generic.confirm") }}

</template>

<script lang="ts">
import { Vue, Component, Prop, InjectReactive } from "vue-property-decorator";
import { faAuthor, openFolderDialog, saveSubs } from "@/renderer/api";
import { Author } from "furaffinity-api/dist/interfaces";
import { AriaConfig } from "@/main/database";
import { join, isAbsolute } from "path";
import { Subscription } from "../../../main/database/entity";
import bus from "@/renderer/utils/EventBus";

@Component
export default class AddSingleSubForm extends Vue {
  @InjectReactive() ariaConfig!: AriaConfig | null;
  @InjectReactive() subs!: Subscription[];

  step: number = 1;
  user: Author | null = null;
  loading = false;

  form: any = {
    username: "",
    dir: "",
    gallery: true,
    scraps: false
  };

  rules: Object = {
    username: [{ validator: this.validateUsername, trigger: "change" }],
    dir: [{ validator: this.validateDir, trigger: "change" }]
  };

  validateUsername(rule: any, value: any, callback: Function) {
    if (/^[a-zA-Z0-9-_~.]+$/.exec(value)) {
      callback();
    } else {
      callback(new Error(this.$tc("header.tab_add_single.username_error")));
    }
  }

  validateDir(rule: any, value: any, callback: Function) {
    if (isAbsolute(value)) {
      callback();
    } else {
      callback(new Error(this.$tc("header.tab_add_single.dir_error")));
    }
  }

  get galleryPath() {
    return this.form.dir;
  }

  get scrapsPath() {
    return join(this.form.dir, "scraps");
  }

  async choseDir() {
    const paths = await openFolderDialog();
    if (paths && paths.length > 0) {
      this.form.dir = join(paths[0], this.user?.id ?? "");
    }
  }

  checkStep1() {
    const form: any = this.$refs["addSingleSubForm"];
    form.validate(async (valid: boolean) => {
      if (valid && !this.loading) {
        this.loading = true;

        const user = await faAuthor(this.form.username);
        if (!user) {
          this.$message.error(this.$tc("header.tab_add_single.fetch_error"));
        } else if (this.subs.filter(sub => sub.id === user.id).length > 0) {
          this.$message.error(this.$tc("header.tab_add_single.existed_error"));
        } else if (user) {
          this.user = user;
          this.form.dir = join(this.ariaConfig?.dir ?? "", user.id);
          this.step = 2;
        }

        this.loading = false;
      } else {
        return false;
      }
    });
  }

  checkStep2() {
    const form: any = this.$refs["addSingleSubForm"];
    form.validate(async (valid: boolean) => {
      if (valid && !this.loading && this.user) {
        const sub = new Subscription();

        sub.id = this.user.id;
        sub.name = this.user.name;
        sub.url = this.user.url;
        sub.avatar = this.user.avatar;
        sub.gallery = this.form.gallery;
        sub.scraps = this.form.scraps;
        sub.dir = this.form.dir;
        sub.galleryDir = this.galleryPath;
        sub.scrapsDir = this.scrapsPath;

        console.log([sub]);
        bus.$emit("sub.add", [sub]);

        this.user = null;
        this.form.username = "";
        this.step = 1;
      } else {
        return false;
      }
    });
  }

  submit() {
    if (this.step === 1) {
      this.checkStep1();
    } else {
      this.checkStep2();
    }
  }
}
</script>

<style>
.add-sub-form .el-tabs__item {
  color: inherit;
}

.add-sub-form .el-form-item__label {
  color: inherit;
}

.mr-4 {
  margin-right: 8px;
}

.text-large {
  font-size: 1.1rem;
}
</style>
