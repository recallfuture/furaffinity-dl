<template>
  <div class="flex flex-col h-screen">
    <NPageHeader title="网页登录" @back="back">
      <template #extra>
        <NButton @click="refresh">刷新</NButton>
      </template>
    </NPageHeader>
    <webview :src="url" class="w-full flex-1"></webview>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { NPageHeader, NButton } from "naive-ui";

const router = useRouter();
const back = router.back;

const url = ref("");
const refresh = () => {
  url.value = "https://www.furaffinity.net/login/?r=" + Math.random();
};

refresh();
</script>

<style scoped></style>
