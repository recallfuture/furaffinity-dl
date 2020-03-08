<template lang="pug">
  el-form(
    :rules="rules"
    :model="form"
    @submit.native.prevent="submit"
    ref="addWatchingSubsForm"
    status-icon
    label-width="110px"
  )
    el-form-item
      span {{ $t("header.tab_import.example", { path: getPath({id: "furry", name: "Furry"}) }) }}

    el-form-item( :label="$t('header.tab_import.path')" prop="path" )
      el-input( v-model="form.path" autofocus )
        el-button( slot="prepend" icon="el-icon-folder" @click="chosePath" )
    
    el-form-item( :label="$t('header.tab_import.prefix')" )
      el-input( v-model="form.prefix" )

    el-form-item( :label="$t('header.tab_import.dir')" )
      el-select( v-model="form.dir" )
        el-option(
          v-for="item in dirOptions"
          :key="item.key"
          :label="item.value"
          :value="item.key"
        )
    
    el-form-item( :label="$t('header.tab_import.suffix')" )
      el-input( v-model="form.suffix" )
    
    el-form-item( label="Gallery" )
      el-switch( v-model="form.gallery" class="mr-4" )

    el-form-item( label="Scraps" )
      el-switch( v-model="form.scraps" class="mr-4" )

    el-form-item
      el-button( type="primary" @click="submit" :loading="loading" ) {{ $t("generic.confirm") }}

</template>

<script lang="ts">
import { Vue, Component, Prop, InjectReactive } from "vue-property-decorator";
import {
  faAuthor,
  openFolderDialog,
  saveSubs,
  faWatchingList
} from "@/renderer/api";
import { Author } from "furaffinity-api/dist/interfaces";
import { AriaConfig } from "@/main/database";
import { join, isAbsolute } from "path";
import { Subscription } from "../../../main/database/entity";
import bus from "@/renderer/utils/EventBus";
import _ from "lodash";
import logger from "@/shared/logger";

@Component
export default class AddWatchingSubsForm extends Vue {
  @InjectReactive() ariaConfig!: AriaConfig | null;
  @InjectReactive() subs!: Subscription[];

  users: Author[] = [];
  loading = false;

  form: any = {
    path: this.ariaConfig?.dir ?? "",
    prefix: "",
    dir: "id",
    suffix: "",
    gallery: true,
    scraps: false
  };

  get rules() {
    return {
      path: [{ validator: this.validateDir, trigger: "change" }]
    };
  }

  get dirOptions() {
    return [
      { key: "id", value: this.$tc("header.tab_import.dirOptions.id") },
      { key: "name", value: this.$tc("header.tab_import.dirOptions.name") },
      { key: "Id", value: this.$tc("header.tab_import.dirOptions.Id") },
      { key: "Name", value: this.$tc("header.tab_import.dirOptions.Name") }
    ];
  }

  validateDir(rule: any, value: any, callback: Function) {
    if (isAbsolute(value)) {
      callback();
    } else {
      callback(new Error(this.$tc("header.tab_add_single.dir_error")));
    }
  }

  get subHash() {
    const result: { [propName: string]: Subscription } = {};
    for (const sub of this.subs) {
      result[sub.id] = sub;
    }
    return result;
  }

  mounted() {
    this.form.path = this.ariaConfig?.dir ?? "";
  }

  async chosePath() {
    const paths = await openFolderDialog();
    if (paths && paths.length > 0) {
      this.form.path = paths[0];
    }
  }

  getPath(user: Author) {
    let baseName;
    switch (this.form.dir) {
      case "name": {
        baseName =
          this.form.prefix.trim() + user.name + this.form.suffix.trim();
        break;
      }
      case "Id": {
        baseName =
          this.form.prefix.trim() +
          _.upperFirst(user.id) +
          this.form.suffix.trim();
        break;
      }
      case "Name": {
        baseName =
          this.form.prefix.trim() +
          _.upperFirst(user.name) +
          this.form.suffix.trim();
        break;
      }
      default: {
        // id
        baseName = this.form.prefix.trim() + user.id + this.form.suffix.trim();
        break;
      }
    }
    return join(this.form.path, baseName);
  }

  submit() {
    const form: any = this.$refs["addWatchingSubsForm"];
    form.validate(async (valid: boolean) => {
      if (valid && !this.loading) {
        this.loading = true;

        const users: Author[] | null = await faWatchingList();
        if (users === null || users.length === 0) {
          this.loading = false;
          return false;
        }

        const subs = users
          .map(user => {
            const baseDir = this.getPath(user);
            const galleryDir = baseDir;
            const scrapsDir = join(baseDir, "scraps");
            const sub = new Subscription();

            sub.id = user.id;
            sub.name = user.name;
            sub.url = user.url;
            sub.avatar = user.avatar;
            sub.gallery = this.form.gallery;
            sub.scraps = this.form.scraps;
            sub.dir = baseDir;
            sub.galleryDir = galleryDir;
            sub.scrapsDir = scrapsDir;

            return sub;
          })
          .filter(sub => !this.subHash[sub.id]);

        logger.log(subs);
        bus.$emit("sub.add", subs);
        this.loading = false;
      } else {
        this.loading = false;
        return false;
      }
    });
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
