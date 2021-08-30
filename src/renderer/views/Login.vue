<template>
  <div class="flex flex-col justify-center items-center min-h-screen">
    <h1 class="text-3xl mb-12">Furaffinity-dl</h1>
    <NButton class="w-48" type="primary" @click="gotoWebLoginPage"
      >通过网页登录</NButton
    >
    <p class="m-2">或者</p>
    <NButton class="w-48" @click="cookieModal.show = true"
      >通过 Cookie 登录</NButton
    >
  </div>

  <!-- Cookie 登录窗口 -->
  <NModal
    title="请填写 Cookie 中字段“a”和字段“b”的值"
    v-model:show="cookieModal.show"
    preset="dialog"
    :loading="cookieModal.loading"
    positive-text="确认"
    negative-text="取消"
    @positive-click="handlecookieModalOk"
  >
    <NForm :model="cookieForm">
      <NFormItem label="a">
        <NInput v-model:value="cookieForm.a" placeholder="字段 a 的值" />
      </NFormItem>
      <NFormItem label="b">
        <NInput v-model:value="cookieForm.b" placeholder="字段 b 的值" />
      </NFormItem>
    </NForm>
  </NModal>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { NButton, NModal, NForm, NFormItem, NInput } from "naive-ui";

// 网页登录相关
const router = useRouter();
const gotoWebLoginPage = () => router.push("/web-login");

// Cookie 登录相关
const cookieModal = reactive({
  show: false,
  loading: false,
});

const cookieForm = reactive({
  a: "",
  b: "",
});

const handlecookieModalOk = () => {
  //
};
</script>
