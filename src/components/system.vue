<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message} from "ant-design-vue"

import type {SystemConfig} from "@/types/system";

const {data: systemConfig} = useApi<SystemConfig>('api/system', {
  initialData: {
    OPENAI_API_KEY: '',
    OPENAI_BASE_URL: '',
    OPENAI_MODEL_NAME: '',
    OPENAI_PROXY_URL: '',
    OPENAI_EXTRA_BODY: ''
  }
}).json<SystemConfig>();

const testInfo = reactive({
  testing: false,
  error: null,
});

const saving = ref(false);

const testAi = async () => {
  testInfo.testing = true;
  testInfo.error = null;
  const {data, error} = await useApi('api/system/aitest').post(systemConfig.value).json();
  testInfo.testing = false;
  if (!error.value && data.value) {
    message.success(data.value);
  }
}


const handleSave = async () => {
  saving.value = true;
  const {error} = await useApi('api/system').post(systemConfig.value).json();
  saving.value = false;
  !error.value && message.success("保存成功");
}
</script>

<template>
  <div class="p-4">
    <a-form layout="vertical">
      <!-- AI 配置 -->
      <h3 class="mt-4 mb-2">AI 配置</h3>
      <div class="mb-2 items-center">
        <a-input v-model:value="systemConfig!.OPENAI_BASE_URL" placeholder="AI 模型名称"/>
        <span class="text-gray-500 text-sm">填写服务商提供的、兼容OpenAI格式的API地址</span>
      </div>
      <div class="mb-2 items-center">
        <a-input v-model:value="systemConfig!.OPENAI_API_KEY" placeholder="AI 服务 API Key"/>
        <span class="text-gray-500 text-sm">AI 服务的 API Key</span>
      </div>
      <div class="mb-2 items-center">
        <a-input v-model:value="systemConfig!.OPENAI_MODEL_NAME" placeholder="AI 模型名称"/>
        <span class="text-gray-500 text-sm">默认使用的模型名称</span>
      </div>
      <div class="mb-2 items-center">
        <a-input v-model:value="systemConfig!.OPENAI_PROXY_URL" placeholder="AI 代理地址"/>
        <span class="text-gray-500 text-sm">请求ai时的代理地址</span>
      </div>
      <div class="mb-2 items-center">
        <a-input v-model:value="systemConfig!.OPENAI_EXTRA_BODY" placeholder="extra_body"/>
        <span class="text-gray-500 text-sm">请求ai时传递给extra_body额外额参数，需要json字符串</span>
      </div>
    </a-form>

    <div v-if="testInfo.error">
      {{ testInfo.error }}
    </div>

    <div class="space-x-sm">
      <a-button @click="testAi" :loading="testInfo.testing">链接测试</a-button>
    </div>

    <div class="flex gap-2 mt-4 w-fit ml-auto">
      <a-button type="primary" @click="handleSave" :loading="saving">保存</a-button>
    </div>
  </div>
</template>
