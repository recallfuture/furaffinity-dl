<template lang="pug">
div( class="sub-table" )
  pl-table(
    :datas="calcSubs"
    :default-sort="{ prop: 'id', order: 'ascending' }"
    ref="subTable"
    :pagination-show="false"
    auto-resize
    big-data-checkbox
    @row-click="handleRowClick"
    @selection-change="handleSelectionChange"
  )
    //- 复选框
    pl-table-column( type="selection" width="40" )
    //- 状态
    pl-table-column(
      :label="$t('sub.status.label')"
      width="80"
      align="center"
      :filters="statusFilters"
      :filter-method="filterStatus"
      filter-placement="bottom"
    )
      template( slot-scope="{ row }")
        el-tag( v-if="row.status === 'active'" type="success" effect="dark" ) {{ $t("sub.status.active") }}
    //- 用户头像
    pl-table-column( :label="$t('main.table.avatar')" align="center" width="80" )
      template( slot-scope="{ row }")
        el-avatar( :size="36" :src="row.avatar" )
    //- 用户名
    pl-table-column( prop="id" :label="$t('main.table.username')" sortable )
      template( slot-scope="{ row }")
        span {{ row.name }}
    //- Gallery
    pl-table-column(
      label="Gallery"
      width="120"
      align="center"
      prop="galleryTaskNum"
      sortable
      :filters="galleryFilters"
      :filter-method="filterGallery"
      filter-placement="bottom"
    )
      template( slot-scope="{ row }")
        span( v-if="row.gallery" class="gallery-task-num" ) {{ row.galleryTaskNum }}
        i( v-else class="el-icon-close" )
    //- Scraps
    pl-table-column(
      label="Scraps"
      width="120"
      align="center"
      prop="scrapsTaskNum"
      sortable
      :filters="scrapsFilters"
      :filter-method="filterScraps"
      filter-placement="bottom"
    )
      template( slot-scope="{ row }")
        span( v-if="row.scraps" class="scraps-task-num" ) {{ row.scrapsTaskNum }}
        i( v-else class="el-icon-close" )
    //- 主页地址
    pl-table-column( prop="url" :label="$t('main.table.home_url')" align="center" sortable )
      template( slot-scope="{ row }")
        el-link( type="primary" @click="openUrl(row.url)" ) {{ row.url }}
    //- 保存目录
    pl-table-column( prop="dir" :label="$t('main.table.dir')" align="center" sortable )
      template( slot-scope="{ row }")
        el-link( type="primary" @click="openFolder(row.dir)" ) {{ row.dir }}
</template>

<script lang="ts">
import { Vue, Component, Prop, InjectReactive } from "vue-property-decorator";
import { Subscription } from "@/main/database/entity";
import bus from "@/renderer/utils/EventBus";
import { openUrl } from "@/renderer/api";
import { openFolder } from "../../api/ipc";

@Component
export default class SubTable extends Vue {
  @InjectReactive() subs!: Subscription[];

  search: String = "";
  currentRow: Subscription | null = null;
  multipleSelection: Subscription[] = [];

  openUrl = openUrl;
  openFolder = openFolder;

  ctrlDown = false;
  shiftDown = false;

  get statusFilters() {
    return [{ text: this.$tc("sub.status.active"), value: "active" }];
  }

  get calcSubs() {
    return this.subs.filter(sub => {
      const s = this.search.toLowerCase();
      return sub.name.toLowerCase().includes(s);
    });
  }

  filterStatus(value: any, row: any, column: any) {
    return row.status === value;
  }

  get galleryFilters() {
    return [
      { text: "未开启", value: "close" },
      { text: "已开启", value: "open" }
    ];
  }

  filterGallery(value: any, row: any, column: any) {
    return value === "close" ? !row.gallery : row.gallery;
  }

  get scrapsFilters() {
    return [
      { text: "未开启", value: "close" },
      { text: "已开启", value: "open" }
    ];
  }

  filterScraps(value: any, row: any, column: any) {
    return value === "close" ? !row.scraps : row.scraps;
  }

  mounted() {
    bus.$on("header.start", this.handleHeaderStart);
    bus.$on("header.delete", this.handleHeaderDelete);
    bus.$on("header.searchChange", (search: any) => {
      this.search = search;
    });

    addEventListener("keydown", this.keyDown, false);
    addEventListener("keyup", this.keyUp, false);
  }

  beforeDestroy() {
    bus.$off("header.start", this.handleHeaderStart);
    bus.$off("header.delete", this.handleHeaderDelete);

    removeEventListener("keydown", this.keyDown);
    removeEventListener("keyup", this.keyUp);
  }

  handleRowClick(row: any, event: any, column: any) {
    const subTable: any = this.$refs.subTable;

    if (this.ctrlDown) {
      // ctrl多选，如果点击两次同样会取消选中
      subTable.toggleRowSelection([{ row }]);
      return;
    }

    this.currentRow = row;
    bus.$emit("sub.select", row);
  }

  handleSelectionChange(val: Subscription[]) {
    this.multipleSelection = val;
  }

  handleHeaderStart() {
    bus.$emit("sub.start", this.multipleSelection);
  }

  handleHeaderDelete() {
    bus.$emit("sub.delete", this.multipleSelection);
  }

  keyDown(event: any) {
    const key = event.keyCode;
    if (key === 17) this.ctrlDown = true;
    if (key === 16) this.shiftDown = true;
  }

  keyUp(event: any) {
    const key = event.keyCode;
    if (key === 17) this.ctrlDown = false;
    if (key === 16) this.shiftDown = false;
  }
}
</script>

<style>
.sub-table {
  height: 100%;
}
.sub-table .el-table {
  border: 0;
  background-color: #444;
}
.sub-table .plTableBox .el-table .el-table__header th {
  color: rgba(256, 256, 256, 0.87);
  background-color: #333;
}
.sub-table .plTableBox .el-table .el-table__header th.is-leaf {
  border: 0;
}
.plTableBox .el-table tr {
  color: rgba(256, 256, 256, 0.87);
  background-color: #444;
}
.plTableBox .el-table td {
  border: 0;
}
.plTableBox .el-table--enable-row-hover .el-table__body tr:hover > td,
.plTableBox .el-table__body tr.current-row > td {
  background-color: #666;
}
.plTableBox .el-table::before {
  background-color: transparent;
}

.gallery-task-num {
  color: #409eff;
  font-weight: bold;
  font-size: 1.2rem;
}
.scraps-task-num {
  color: #67c23a;
  font-weight: bold;
  font-size: 1.2rem;
}
</style>
