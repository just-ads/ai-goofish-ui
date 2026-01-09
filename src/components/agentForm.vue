<script setup lang="ts" generic="T extends AgentConfig">

import {message} from "ant-design-vue";
import {DeleteOutlined, PlusOutlined, DownOutlined} from "@ant-design/icons-vue";
import {AgentConfig, AgentTemplate} from "@/types/system";
import {reactive} from "vue";
import {useApi} from "@/api/fetch";
import clone from "fast-clone";
import {safeStringify} from "@/utils/utils";

const props = defineProps<{ modelValue: T }>()

const form = reactive({...props.modelValue})

const advancedVisible = ref(false);

const {data: agentTemplates} = useApi('api/system/agent-templates').json<AgentTemplate[]>();

const applyTemplate = (id: string) => {
  console.log(id)
  const template = agentTemplates.value?.find(it => it.id === id);
  if (!template) {
    return message.error('未找到模板')
  }
  form.endpoint = template.endpoint;
  form.model = template.model;
  form.headers = clone(template.headers);
  form.body = clone(template.body);
}

const addHeader = () => {

}

const editBody = () => {

}

</script>

<template>
  <div class="space-y-4">
    <a-form :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="Agent名称" required>
        <a-input v-model:value="form.name" placeholder="输入Agent名称"/>
      </a-form-item>

      <a-form-item label="模板选择">
        <a-select
          placeholder="选择预设模板"
          @change="applyTemplate"
          allow-clear
        >
          <a-select-option
            v-for="template in agentTemplates"
            :key="template.id"
            :value="template.id"
          >
            {{ template.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="API端点" required>
        <a-input v-model:value="form.endpoint" placeholder="https://api.openai.com/v1/chat/completions"/>
      </a-form-item>

      <a-form-item label="API密钥">
        <a-input-password v-model:value="form.api_key" placeholder="输入API密钥"/>
      </a-form-item>

      <a-form-item label="模型名称" required>
        <a-input v-model:value="form.model" placeholder="gpt-3.5-turbo"/>
      </a-form-item>

      <a-col align="right">
        <a-button
          type="link"
          @click="advancedVisible = !advancedVisible"
          class="p-0 h-auto"
        >
          {{ advancedVisible ? "收起" : "展开" }}高级配置
          <DownOutlined :class="{ 'rotate-180': advancedVisible }"/>
        </a-button>
      </a-col>

      <template v-if="advancedVisible">
        <a-form-item label="代理地址">
          <a-input v-model:value="form.proxy" placeholder="代理地址 http://proxy:port"/>
        </a-form-item>
        <a-form-item label="请求头配置">
          <a-textarea :value="safeStringify(form.headers)"/>
        </a-form-item>
        <a-form-item label="请求体配置">
          <a-textarea :value="safeStringify(form.body)"/>
        </a-form-item>
      </template>
    </a-form>
  </div>
</template>

<style scoped>

</style>
