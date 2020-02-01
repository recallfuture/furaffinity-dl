<template lang="pug">
  v-card(  )
    v-card-title
      user( :user="sub" )

    v-divider( light)
    
    v-list(  )
      v-list-item
        span 作者名：{{ sub.name }}
      v-list-item
        span 作者主页：{{ sub.url }}
      v-list-item
        span 本地目录：{{ sub.dir }}
      //- v-list-item( v-if="sub.gallery" )
      //-   span( class="text-no-wrap" ) Gallery下载进度：
      //-   v-progress-linear( :value="sub.galleryTasks.length" )
      //- v-list-item( v-if="sub.scraps" )
      //-   span( class="text-no-wrap" ) Scraps下载进度：
      //-   v-progress-linear( :value="sub.scrapsTasks.length" )
</template>

<script>
import User from "../Main/User";

export default {
  name: "DetailBasic",

  props: {
    sub: {
      type: Object,
      required: true
    }
  },

  components: {
    User
  }
};
</script>
