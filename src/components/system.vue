<script setup lang="ts">
import {reactive} from "vue"
import {message} from "ant-design-vue"

// 统一放到一个对象里
const form = reactive({
  OPENAI_API_KEY: '',
  OPENAI_BASE_URL: '',
  OPENAI_MODEL_NAME: '',
  PROXY_URL: '',
});

// 保存
const handleSave = () => {
  message.success("保存成功");
}
</script>

<template>
  <div class="p-4">
    <a-form layout="vertical">
      <!-- AI 配置 -->
      <h3 class="mt-4 mb-2">AI 配置</h3>
      <div class="mb-2 items-center">
        <a-input v-model:value="form.OPENAI_BASE_URL" placeholder="AI 模型名称"/>
        <span class="text-gray-500 text-sm">填写服务商提供的、兼容OpenAI格式的API地址</span>
      </div>
      <div class="mb-2 items-center">
        <a-input v-model:value="form.OPENAI_API_KEY" placeholder="AI 服务 API Key"/>
        <span class="text-gray-500 text-sm">AI 服务的 API Key</span>
      </div>
      <div class="mb-2 items-center">
        <a-input v-model:value="form.OPENAI_MODEL_NAME" placeholder="AI 模型名称"/>
        <span class="text-gray-500 text-sm">默认使用的模型名称</span>
      </div>
    </a-form>

    <div class="w-fit ml-auto space-x-sm">
      <a-button class="">前端链接测试</a-button>
      <a-button class="">后端链接测试</a-button>
    </div>

    <div class="flex gap-2 mt-4">
      <a-button type="primary" @click="handleSave">保存</a-button>
    </div>
  </div>
</template>
