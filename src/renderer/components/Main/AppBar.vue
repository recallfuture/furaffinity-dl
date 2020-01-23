<template lang="pug">
v-app-bar( app )

  v-app-bar-nav-icon( @click="openDrawer" )

  v-toolbar-title Furaffinity-dl

  v-spacer

  div( v-if="$store.state.app.user" )
    v-avatar( size="36" class="mx-2" )
      img( :src="$store.state.app.user.avatar" )
    span( class="mr-2" ) {{ $store.state.app.user.name }}
  div( v-else )
    v-dialog( v-model="dialog" width="800" )
      template( v-slot:activator="{ on }" )
        v-btn( @click="dialog = true" text ) 登录
      login( v-if="dialog" @success="loginSuccess" )
        
      
</template>

<script>
import Login from "../Login/Login";

export default {
  name: "AppBar",

  data() {
    return {
      dialog: false
    };
  },

  components: {
    Login
  },

  methods: {
    openDrawer() {
      this.$store.commit("app/TOGGLE_DRAWER", !this.$store.state.app.drawer);
    },

    openAddDialog() {
      this.$store.commit("app/TOGGLE_ADD_SUBSCRIPTION_DIALOG", true);
    },

    openGuideDialog() {
      this.$store.commit("app/TOGGLE_GUIDE_DIALOG", true);
    },

    async loginSuccess(user) {
      this.$store.commit("app/SET_USER", user);
      this.dialog = false;
    }
  }
};
</script>
