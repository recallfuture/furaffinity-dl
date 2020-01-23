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
    v-btn( @click="login" text ) 登录
      
</template>

<script>
export default {
  name: "AppBar",

  data() {
    return {};
  },

  methods: {
    openDrawer() {
      this.$store.commit("app/TOGGLE_DRAWER", !this.$store.state.app.drawer);
    },

    openAddDialog() {
      this.$store.commit("app/TOGGLE_ADD_SUBSCRIPTION_DIALOG", true);
    },

    login() {},

    startAll() {},

    stopAll() {}
  }
};
</script>
