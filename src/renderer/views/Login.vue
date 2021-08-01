<template>
  <div class="flex flex-col justify-center items-center min-h-screen">
    <h1 class="text-3xl mb-12">Furaffinity-dl</h1>
    <a-button class="w-48" type="primary" @click="gotoWebLoginPage"
      >通过网页登录</a-button
    >
    <p class="m-2">或者</p>
    <a-button class="w-48" @click="cookieModal.visible = true"
      >通过 Cookie 登录</a-button
    >
  </div>

  <!-- Cookie 登录窗口 -->
  <a-modal
    title="请填写 Cookie 中字段“a”和字段“b”的值"
    width="500px"
    v-model:visible="cookieModal.visible"
    :confirm-loading="cookieModal.confirmLoading"
    @ok="handlecookieModalOk"
  >
    <a-form :model="cookieForm">
      <a-form-item label="a">
        <a-input v-model:value="cookieForm.a" placeholder="字段 a 的值" />
      </a-form-item>
      <a-form-item label="b">
        <a-input v-model:value="cookieForm.b" placeholder="字段 b 的值" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const gotoWebLoginPage = () => router.push("/web-login");

    const { cookieModal, cookieForm, handlecookieModalOk } = useCookieLogin();

    return {
      gotoWebLoginPage,
      cookieModal,
      cookieForm,
      handlecookieModalOk,
    };
  },
});

/**
 * Cookie 登录相关
 */
function useCookieLogin() {
  const cookieModal = reactive({
    visible: false,
    confirmLoading: false,
  });

  const cookieForm = reactive({
    a: "",
    b: "",
  });

  const handlecookieModalOk = () => {
    cookieModal.visible = false;
  };

  return {
    cookieModal,
    cookieForm,
    handlecookieModalOk,
  };
}
</script>
