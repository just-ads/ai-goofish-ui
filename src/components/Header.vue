<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message} from "ant-design-vue";
import {UserOutlined, CloudSyncOutlined, DeleteOutlined, RobotOutlined, CheckCircleOutlined, ExclamationCircleOutlined} from '@ant-design/icons-vue';

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
  <header class="flex items-center justify-between h-[64px] px-6 border-b border-white/10 bg-black/20 backdrop-blur-md">
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
        <RobotOutlined class="text-xl text-white"/>
      </div>
      <h2 class="text-xl font-bold m-0 gradient-text tracking-wide">
        闲鱼监控机器人
        <span class="text-xs font-normal text-gray-400 ml-2 tracking-normal opacity-60">AI Goofish Control Panel</span>
      </h2>
    </div>
    
    <div class="flex items-center">
      <a-dropdown v-if="isLogin">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 cursor-pointer hover:bg-success/20 transition-colors group">
          <div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span class="text-success font-medium text-sm group-hover:text-success/90">咸鱼已登录</span>
          <UserOutlined class="text-success ml-1"/>
        </div>
        <template #overlay>
          <a-menu class="!bg-gray-800 !border !border-gray-700 !shadow-xl !rounded-lg overflow-hidden">
            <a-menu-item @click="update" class="!text-gray-200 hover:!bg-gray-700">
              <template #icon><CloudSyncOutlined/></template>
              更新 Cookie
            </a-menu-item>
            <a-menu-item @click="remove" class="!text-red-400 hover:!bg-red-900/20">
              <template #icon><DeleteOutlined/></template>
              删除 Cookie
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      
      <div v-else @click="showModal" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-error/10 border border-error/20 cursor-pointer hover:bg-error/20 transition-colors group">
        <div class="w-2 h-2 rounded-full bg-error"></div>
        <span class="text-error font-medium text-sm group-hover:text-error/90">未登录 (点击设置)</span>
        <ExclamationCircleOutlined class="text-error ml-1"/>
      </div>
    </div>

    <a-modal 
      title="更新 Cookie"
      v-model:open="open"
      :confirmLoading="confirmLoading"
      @ok="handleOk"
      :maskStyle="{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.6)' }"
      wrapClassName="dark-modal"
    >
      <div class="py-4">
        <div class="mb-2 text-gray-400 text-sm">请粘贴最新的 JSON 格式 Cookie 数据：</div>
        <a-textarea
          :rows="8"
          v-model:value="jsonInput"
          placeholder='{"cookie": "..."}'
          class="!bg-black/30 !border-gray-700 !text-gray-200 focus:!border-primary-500 !rounded-lg font-mono text-xs"
        />
      </div>
    </a-modal>
  </header>
</template>

<style scoped>
/* Gradient Text from theme.css */
.gradient-text {
  background: linear-gradient(135deg, var(--primary-400), var(--secondary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
