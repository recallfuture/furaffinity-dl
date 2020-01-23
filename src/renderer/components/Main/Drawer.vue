<template lang="pug">
v-navigation-drawer( app v-model="drawer" width="300" mobile-break-point="0" )
  v-toolbar
    v-toolbar-title 订阅

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
      v-list-item( v-for="subscription in subscriptions" :key="subscription.author.id"  )
        //- 作者头像
        v-list-item-avatar
          v-img( :src="subscription.author.avatar" )
        //- 作者名
        v-list-item-content
          v-list-item-title {{ subscription.author.name }}
        //- Gallery 和 Scraps 的标签
        v-list-item-action
          div
            v-chip( v-show="subscription.gallery" class="mr-2" color="info" ) G
            v-chip( v-show="subscription.scraps" class="mr-2" color="warning" ) S
      

      
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Drawer",

  data() {
    return {
      query: "",
      item: -1,
      user: {
        avatar: "http://a.facdn.net/1496933393/recallfuture.gif",
        name: "recallfuture",
        id: "recallfuture"
      }
    };
  },

  computed: {
    drawer: {
      get() {
        return this.$store.state.app.drawer;
      },
      set(value) {
        this.$store.commit("app/TOGGLE_DRAWER", value);
      }
    },

    ...mapState("subscription/", {
      subscriptions: state => state.subscriptions
    })
  },

  methods: {
    add() {
      this.$store.commit("app/TOGGLE_ADD_SUBSCRIPTION_DIALOG", true);
    }
  }
};
</script>
