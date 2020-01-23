<template lang="pug">
v-navigation-drawer( app v-model="model" width="300" mobile-break-point="0" )
  v-toolbar
    v-toolbar-title {{ title }}
    v-spacer

    //- 全部开始/停止
    v-btn( @click="add" icon ) 
      v-icon mdi-play
    v-spacer
    
    //- 添加订阅
    v-btn( @click="add" color="primary" rounded ) 添加订阅

  //- 订阅列表
  v-list( rounded )
    v-list-item-group( v-model="item" color="primary" )
      v-list-item( v-for="s in subs" :key="s.author.id"  )
        //- 作者头像
        v-list-item-avatar
          v-img( :src="s.author.avatar" )
        //- 作者名
        v-list-item-content
          v-list-item-title {{ s.author.name }}
        //- Gallery 和 Scraps 的标签
        v-list-item-action
          div
            v-chip( v-show="s.gallery" class="mr-2" color="info" ) G
            v-chip( v-show="s.scraps" class="mr-2" color="warning" ) S
      

      
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Drawer",

  model: {
    prop: "drawer",
    event: "change"
  },

  props: {
    drawer: {
      type: Boolean,
      default: true
    },

    title: {
      type: String,
      default: ""
    },

    subs: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      model: this.drawer,
      item: -1
    };
  },

  methods: {
    add() {
      this.$emit("addSub:open");
    }
  },

  watch: {
    model(value) {
      this.$emit("change", value);
    },

    drawer(value) {
      this.model = value;
    }
  }
};
</script>
