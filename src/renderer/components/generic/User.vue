<template lang="pug">
  div( class="user" )
    el-avatar( :size="36" :src="sub.avatar" class="avatar" )
    span( class="username" ) {{ sub.name }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Subscription } from "@/main/database/entity";

@Component
export default class User extends Vue {
  @Prop(Object) sub!: Subscription;
}
</script>

<style scoped>
.user {
  display: flex;
  align-items: center;
}

.user .avatar {
  margin-right: 10px;
}

.user .username {
  font-size: 1.2rem;
}
</style>
