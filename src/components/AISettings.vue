<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message, Modal} from "ant-design-vue";
import {PlusOutlined, DeleteOutlined, ThunderboltOutlined} from "@ant-design/icons-vue";
import AIForm from "@/components/AIForm.vue";

import type {AIConfig} from "@/types/ai";

const {data: configList, execute: refreshConfigList} = useApi('/api/ai', {
  initialData: []
}).json<AIConfig[]>();


const loading = ref(false);
const testingMap = reactive(new Map<string, 'testing' | 'success' | 'failure'>());

const addConfig = () => {
  const config = ref<AIConfig>({
    id: '',
    name: "AI",
    endpoint: "",
    api_key: "",
    model: "",
    headers: {
      "Authorization": "Bearer {key}",
      "Content-Type": "application/json"
    },
    body: {
      "model": "{model}",
      "messages": "{messages}"
    }
  });

  Modal.confirm({
    title: '创建 AI 配置',
    width: 600,
    content: h(AIForm, {
      modelValue: config.value,
      'onUpdate:modelValue': (val: AIConfig) => config.value = val
    }),
    async onOk() {
      try {
        loading.value = true;

        const {error} = await useApi('/api/ai').post(config.value).json();

        if (!error.value) {
          message.success('已添加');
          await refreshConfigList();
        } else {
          return Promise.reject();
        }
      } catch (err) {
        message.error('添加时发生错误');
        return Promise.reject();
      } finally {
        loading.value = false;
      }
    }
  });
};


const deleteConfig = (id: string) => {
  const config = configList.value?.find(it => it.id === id);
  if (!config) return;


  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 "${config.name}" 吗？`,
    async onOk() {
      try {
        loading.value = true;
        const {error} = await useApi(`/api/ai/${config.id}`).delete().json();

        if (!error.value) {
          message.success('已删除');
          await refreshConfigList();
        } else {
          message.error('删除失败');
        }
      } catch (err) {
        message.error('删除时发生错误');
      } finally {
        loading.value = false;
      }
    }
  });
};


const editConfig = (id: string) => {
  const config = configList.value?.find(it => it.id === id);
  if (!config) return;

  const editingConfig = ref<AIConfig>(config);

  Modal.confirm({
    title: '编辑 AI 配置',
    width: 600,
    content: h(AIForm, {
      modelValue: editingConfig.value,
      hideTemplate: true,
      'onUpdate:modelValue': (val: AIConfig) => editingConfig.value = val
    }),
    async onOk() {
      try {
        loading.value = true;
        const {error} = await useApi(`/api/ai/${editingConfig.value.id}`).post(editingConfig.value).json();

        if (!error.value) {
          message.success('已更新');
          await refreshConfigList();
        } else {
          return Promise.reject();
        }
      } catch (err) {
        message.error('更新时发生错误');
        return Promise.reject();
      } finally {
        loading.value = false;
      }
    }
  });
};

const testConfig = async (id: string) => {
  const config = configList.value?.find(it => it.id === id);
  if (!config) return;
  testingMap.set(id, 'testing');
  try {
    const {error} = await useApi(`/api/ai/${config.id}/test`).post().json();

    if (!error.value) {
      testingMap.set(id, 'success');
      message.success('连接测试成功');
    } else {
      testingMap.set(id, 'failure');
    }
  } catch (err) {
    testingMap.set(id, 'failure');
    message.error('测试连接时发生错误');
  }
};

const isTesting = (id: string) => {
  return testingMap.get(id) === 'testing';
}

const getColor = (id: string) => {
  const type = testingMap.get(id)
  switch (type) {
    case 'success':
      return '#52c41a';
    case 'failure':
      return '#ef4444';
    case 'testing':
      return '#3b82f6';
    default:
      return 'default'
  }
}

const getText = (id: string) => {
  const type = testingMap.get(id)
  switch (type) {
    case 'success':
      return '测试成功';
    case 'failure':
      return '测试失败';
    case 'testing':
      return '测试中';
    default:
      return '未测试'
  }
}

</script>

<template>
  <div class="flex-col h-full space-y-4">
    <h3 class="text-lg font-medium">AI 配置</h3>

    <!-- Agent列表 -->
    <div class="flex-col flex-1 h-0">
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-medium">已配置的 AI</h4>
        <a-button type="primary" @click="addConfig" :loading="loading">
          <PlusOutlined/>
          添加AI
        </a-button>
      </div>

      <div v-if="configList && configList.length > 0" class="space-y-3 h-0 flex-1 overflow-auto">
        <div
          v-for="config in configList"
          :key="config.id"
          class="border border-gray-200 rounded p-4 bg-blueGray hover:border-blue-300 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h5 class="font-medium text-gray-800">{{ config.name }}</h5>
                <span class="text-xs px-2 py-1 rounded text-gray-600">
                  {{ config.model }}
                </span>
                <a-tag :color="getColor(config.id)">{{ getText(config.id) }}</a-tag>
              </div>

              <div class="text-sm text-gray-600 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">端点:</span>
                  <code class="text-xs px-2 py-1 rounded truncate max-w-md">
                    {{ config.endpoint }}
                  </code>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">API密钥:</span>
                  <span class="text-xs">
                    {{ config.api_key ? '••••••••' : '未设置' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-2 ml-4">
              <a-button
                type="primary"
                size="small"
                @click="editConfig(config.id)"
                :disabled="isTesting(config.id)"
              >
                编辑
              </a-button>
              <a-button
                type="default"
                size="small"
                @click="testConfig(config.id)"
                :loading="isTesting(config.id)"
              >
                <ThunderboltOutlined/>
                测试
              </a-button>
              <a-button
                type="text"
                danger
                size="small"
                @click="deleteConfig(config.id)"
                :disabled="isTesting(config.id)"
              >
                <DeleteOutlined/>
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 border border-dashed border-gray-300 rounded">
        <p class="text-gray-500 mb-4">尚未配置任何 AI</p>
        <a-button type="primary" @click="addConfig">
          <PlusOutlined/>
          添加第一个 AI
        </a-button>
      </div>
    </div>
  </div>
</template>
