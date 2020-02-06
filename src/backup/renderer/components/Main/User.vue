<template lang="pug">
  div
    v-avatar( size="36" class="mr-2" )
      img( :src="user.avatar" )
    span( class="mr-2" ) {{ user.name }}
</template>

<script>
import bus from "@/renderer/utils/EventBus";

export default {
  name: "User",

  props: {
    user: {
      type: Object,
      default: null
    }
  }
};
</script>
