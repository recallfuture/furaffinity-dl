<template lang="pug">
v-data-table( 
  :headers="headers"
  :items="items"
  disable-pagination
  hide-default-footer
  show-select
)
  //- 头像
  template( v-slot:item.author.avatar="{ item }" )
    v-avatar( size="36" tile )
      img( :src="item.author.avatar" )
  
  //- Gallery
  template( v-slot:item.gallery="{ item }" )
    v-switch( v-model="item.gallery" disabled )

  //- Scraps
  template( v-slot:item.scraps="{ item }" )
    v-switch( v-model="item.scraps" disabled )

  //- 状态
  template( v-slot:item.status="{ item }" )
    //- TODO: 状态展示
    span {{ item.status }}
</template>

<script>
export default {
  name: "DataTable",

  data() {
    return {
      headers: [
        { text: "头像", value: "author.avatar", width: 80 },
        { text: "用户名", value: "author.name" },
        { text: "保存位置", value: "dir" },
        { text: "Gallery", value: "gallery" },
        { text: "Scraps", value: "scraps" },
        { text: "状态", value: "status" }
      ],
      items: this.$store.state.subscription.subscriptions
    };
  }
};
</script>
