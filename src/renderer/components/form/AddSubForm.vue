<template lang="pug">
  el-tabs( class="add-sub-form" v-model="activeTab" )
    el-tab-pane( :label="$t('header.tab_add_single.title')" name="single" )
      AddSingleSubForm
    el-tab-pane( :label="$t('header.tab_import.title')" name="import" )
      AddWatchingSubsForm
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import AddSingleSubForm from "./AddSingleSubForm.vue";
import AddWatchingSubsForm from "./AddWatchingSubsForm.vue";

@Component({
  components: { AddSingleSubForm, AddWatchingSubsForm }
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
