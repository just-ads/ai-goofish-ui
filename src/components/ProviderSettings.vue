<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message, Modal} from "ant-design-vue";
import {PlusOutlined, DeleteOutlined, ThunderboltOutlined} from "@ant-design/icons-vue";
import type {ProviderConfig} from "@/types/provider";
import ProviderForm from "@/components/ProviderForm.vue";

// 使用独立的API接口管理Provider配置
const {data: providers, execute: refreshProviders} = useApi('/api/providers', {
  initialData: []
}).json<ProviderConfig[]>();


const loading = ref(false);
const testing = ref(false);

// 添加Provider的模态框
const addProviderModal = () => {
  const providerConfig = ref<ProviderConfig>({
    id: '',
    name: "provider",
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
    title: '创建Provider',
    width: 600,
    content: h(ProviderForm, {
      modelValue: providerConfig.value,
      'onUpdate:modelValue': (val: ProviderConfig) => providerConfig.value = val
    }),
    async onOk() {
      try {
        loading.value = true;
        const newProvider = providerConfig.value;

        // 通过API创建Provider
        const {error} = await useApi('/api/providers').post(newProvider).json();

        if (!error.value) {
          message.success('Provider已添加');
          await refreshProviders();
        } else {
          message.error('添加Provider失败');
        }
      } catch (err) {
        message.error('添加Provider时发生错误');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 删除Provider
const deleteProvider = (id: string) => {
  const provider = providers.value?.find(it => it.id === id);
  if (!provider) return;


  Modal.confirm({
    title: '确认删除',
    content: `确定要删除Provider "${provider.name}" 吗？`,
    async onOk() {
      try {
        loading.value = true;
        const {error} = await useApi(`/api/providers/${provider.id}`).delete().json();

        if (!error.value) {
          message.success('Provider已删除');
          await refreshProviders();
        } else {
          message.error('删除Provider失败');
        }
      } catch (err) {
        message.error('删除Provider时发生错误');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 编辑Provider
const editProvider = (id: string) => {
  const provider = providers.value?.find(it => it.id === id);
  if (!provider) return;

  const providerConfig = ref<ProviderConfig>(provider);


  Modal.confirm({
    title: '编辑Provider',
    width: 600,
    content: h(ProviderForm, {
      modelValue: providerConfig.value,
      'onUpdate:modelValue': (val: ProviderConfig) => providerConfig.value = val
    }),
    async onOk() {
      try {
        loading.value = true;
        // 通过API更新Provider
        const {error} = await useApi(`/api/providers/${providerConfig.value.id}`).post(providerConfig.value).json();

        if (!error.value) {
          message.success('Provider已更新');
          await refreshProviders();
        } else {
          message.error('更新Provider失败');
        }
      } catch (err) {
        message.error('更新Provider时发生错误');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 测试Provider连接
const testProvider = async (id: string) => {
  const provider = providers.value?.find(it => it.id === id);
  if (!provider) return;


  try {
    testing.value = true;
    const {error} = await useApi(`/api/providers/${provider.id}/test`).post().json();

    if (!error.value) {
      message.success('Provider连接测试成功');
    } else {
      message.error('Provider连接测试失败');
    }
  } catch (err) {
    message.error('测试Provider连接时发生错误');
  } finally {
    testing.value = false;
  }
};
</script>

<template>
  <div class="flex-col h-full space-y-4">
    <h3 class="text-lg font-medium">AI Provider配置</h3>

    <!-- Agent列表 -->
    <div class="flex-col flex-1">
      <div class="flex justify-between items-center mb-4">
<h4 class="text-md font-medium">已配置的Provider</h4>
        <a-button type="primary" @click="addProviderModal" :loading="loading">
          <PlusOutlined/>
          添加Provider
        </a-button>
      </div>

      <div v-if="providers && providers.length > 0" class="space-y-3 h-0 flex-1 overflow-auto">
        <div
v-for="provider in providers"
          :key="provider.id"
          class="border border-gray-200 rounded p-4 bg-white hover:border-blue-300 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h5 class="font-medium text-gray-800">{{ provider.name }}</h5>
                <span class="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {{ provider.model }}
                </span>
              </div>

              <div class="text-sm text-gray-600 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">端点:</span>
                  <code class="text-xs bg-gray-50 px-2 py-1 rounded truncate max-w-xs">
                    {{ provider.endpoint }}
                  </code>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">API密钥:</span>
                  <span class="text-xs">
                    {{ provider.api_key ? '••••••••' : '未设置' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-2 ml-4">
              <a-button
                type="primary"
                size="small"
                @click="editProvider(provider.id)"
                :disabled="testing"
              >
                编辑
              </a-button>
              <a-button
                type="default"
                size="small"
                @click="testProvider(provider.id)"
                :loading="testing"
              >
                <ThunderboltOutlined/>
                测试
              </a-button>
              <a-button
                type="text"
                danger
                size="small"
                @click="deleteProvider(provider.id)"
                :disabled="testing"
              >
                <DeleteOutlined/>
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 border border-dashed border-gray-300 rounded">
        <p class="text-gray-500 mb-4">尚未配置任何Provider</p>
        <a-button type="primary" @click="addProviderModal">
          <PlusOutlined/>
          添加第一个Agent
        </a-button>
      </div>
    </div>
  </div>
</template>
