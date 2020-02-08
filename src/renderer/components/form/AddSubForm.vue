<template lang="pug">
  el-tabs( class="add-sub-form" v-model="activeTab" )
    el-tab-pane( label="添加一个订阅" name="single" )
      AddSingleSubForm
    el-tab-pane( label="从关注列表导入" name="import" )
      h2 456
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import AddSingleSubForm from "./AddSingleSubForm.vue";

@Component({
  components: { AddSingleSubForm }
})
export default class AddSubForm extends Vue {
  activeTab: string = "single";
}
</script>

<style>
.add-sub-form .el-tabs__item {
  color: inherit;
}
</style>
