<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message} from "ant-design-vue";

const open = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const {data: isLogin} = useApi<boolean>('/api/goofish/status').json();
const jsonInput = ref<string>('');

const showModal = () => {
  open.value = true;
};

const closeModal = () => {
  open.value = false
  jsonInput.value = ''
}

const handleOk = async () => {
  const {error} = await useApi('/api/goofish/state/save').post({content: jsonInput.value});
  if (!error.value) {
    isLogin.value = true;
    message.success('状态保存成功');
    closeModal();
  }
}

const update = () => {
  showModal();
}

const remove = async () => {
  const {error} = await useApi('/api/goofish/state/delete').delete();
  if (!error.value) {
    isLogin.value = false;
    message.success('删除成功');
  }
}


</script>

<template>
  <header class="flex-center border-b border-b-solid border-b-[#ddd] h-[64px] px-5">
    <h2>咸鱼监控机器人后台</h2>
    <a-dropdown v-if="isLogin">
      <a-button type="primary" class="ml-auto">咸鱼已登录</a-button>
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
