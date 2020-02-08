<template lang="pug">
  el-table(
    :data="subs"
    height="100%"
    class="sub-table"
    @selection-change="handleSelectionChange"
  )
    //- 复选框
    el-table-column( type="selection" width="40" )
    //- 用户头像
    el-table-column( :label="$t('main.table.avatar')" align="center" width="80" )
      template( slot-scope="{ row }")
        el-avatar( size="medium" :src="row.avatar" )
    //- 用户名
    el-table-column( prop="name" :label="$t('main.table.username')" width="200" sortable )
    //- Gallery
    el-table-column( label="Gallery" width="100" align="center" )
      template( slot-scope="{ row }")
        span( v-if="row.gallery" class="gallery-task-num" ) {{ row.galleryTaskNum }}
        i( v-else class="el-icon-close" )
    //- Scraps
    el-table-column( label="Scraps" width="100" align="center" )
      template( slot-scope="{ row }")
        span( v-if="row.scraps" class="scraps-task-num" ) {{ row.scrapsTaskNum }}
        i( v-else class="el-icon-close" )
    //- 主页地址
    el-table-column( prop="url" :label="$t('main.table.home_url')" align="center" )
    //- 保存目录
    el-table-column( prop="dir" :label="$t('main.table.dir')" align="center" )
</template>

<script lang="ts">
import { Vue, Component, Prop, InjectReactive } from "vue-property-decorator";
import { Subscription } from "@/main/database/entity";

@Component
export default class SubTable extends Vue {
  @InjectReactive() subs!: Subscription[];

  multipleSelection: Subscription[] = [];

  handleSelectionChange(val: Subscription[]) {
    this.multipleSelection = val;
  }
}
</script>

<style>
.sub-table.el-table {
  background-color: #444;
}
.sub-table.el-table th {
  color: rgba(256, 256, 256, 0.87);
  background-color: #333;
}
.sub-table.el-table th.is-leaf {
  border-bottom: 1px solid #555;
}
.sub-table.el-table tr {
  color: rgba(256, 256, 256, 0.87);
  background-color: #444;
}
.sub-table.el-table td {
  border-bottom: 1px solid #555;
}
.sub-table.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #666;
}
.sub-table.el-table::before {
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
