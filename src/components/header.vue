<script setup lang="ts">
import {isLoginGoofish, loginGoofish, logoutGoofish} from "@/api/goofish";
import {message} from "ant-design-vue";

const open = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const isLogin = ref<boolean>(false);
const jsonInput = ref<string>('');

watchEffect(async () => {
  isLogin.value = await isLoginGoofish();
});

const showModal = () => {
  open.value = true;
};

const closeModal = () => {
  open.value = false
  jsonInput.value = ''
}

const handleOk = async () => {
  try {
    confirmLoading.value = true
    await loginGoofish(jsonInput.value);
    isLogin.value = true;
    message.success('状态保存成功');
    closeModal();
  } catch (err: any) {
    message.error(err.message || '保存失败');
  } finally {
    confirmLoading.value = false
  }
}

const update = () => {
  showModal();
}

const remove = async () => {
  try {
    await logoutGoofish();
    message.success('删除成功');
    isLogin.value = false;
  } catch (err: any) {
    message.error(err.message || '删除失败');
  }
}


</script>

<template>
  <header class="flex-center border-b border-b-solid border-b-[#ddd] h-[64px] px-5">
    <a-dropdown v-if="isLogin">
      <a-button type="primary" class="ml-auto">已登录</a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item @click="update">更新cooking</a-menu-item>
          <a-menu-item @click="remove">删除咸鱼cooking</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <template v-else>
      <a-button danger type="primary" class="ml-auto" @click="showModal">咸鱼未登录(点击设置)</a-button>
    </template>
    <a-modal title="更新Cooking"
             v-model:open="open"
             :confirmLoading="confirmLoading"
             @ok="handleOk">
      <a-textarea
        :rows="6"
        v-model:value="jsonInput"
        placeholder="请输入 JSON 格式数据"
      />
    </a-modal>
  </header>
</template>

<style scoped>

</style>
