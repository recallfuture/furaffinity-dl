<template>
  <div class="flex flex-col h-screen">
    <a-page-header title="网页登录" @back="back">
      <template #extra>
        <a-button @click="refresh"><ReloadOutlined />刷新</a-button>
      </template>
    </a-page-header>
    <webview :src="url" class="w-full flex-1"></webview>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { ReloadOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  components: {
    ReloadOutlined,
  },
  setup() {
    const router = useRouter();
    const back = router.back;

    const { url, refresh } = useLogin();
    refresh();

    return {
      back,
      url,
      refresh,
    };
  },
});

function useLogin() {
  const url = ref("");
  const refresh = () => {
    url.value = "https://www.furaffinity.net/login/?r=" + Math.random();
  };

  return {
    url,
    refresh,
  };
}
</script>

<style scoped></style>
