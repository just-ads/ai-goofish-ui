<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {DeleteOutlined, PlusOutlined, ThunderboltOutlined} from "@ant-design/icons-vue";
import {message, Modal} from "ant-design-vue";
import NotifierForm from "@/components/NotifierForm.vue";

import type {SystemConfig} from "@/types/system";
import type {NotifierConfig} from "@/types/notifier";


const props = defineProps<{
  config: SystemConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: SystemConfig): void;
}>();

const {data: notifiers, execute: refreshNotifiers} = useApi('/api/notifier', {
  initialData: []
}).json<NotifierConfig[]>();

const loading = ref(false);
const testing = ref(false);

const systemConfig = computed(() => props.config);

// 更新配置的辅助函数
const updateConfig = (updates: Partial<SystemConfig>) => {
  const newConfig = {...systemConfig.value, ...updates};
  emit('update:config', newConfig);
};

const addNotifier = () => {
  const notifierConfig = ref<NotifierConfig>({
    id: '',
    type: 'ntfy',
    name: '通知1',
  })
  Modal.confirm({
    title: '新建通知',
    width: 600,
    content: h(NotifierForm, {
      modelValue: notifierConfig.value,
      'onUpdate:modelValue': (val: NotifierConfig) => notifierConfig.value = val,
    }),
    async onOk() {
      try {
        loading.value = true;
        const newNotifier = notifierConfig.value;

        // 通过API创建Agent
        const {error} = await useApi('/api/notifier').post(newNotifier).json();

        if (!error.value) {
          message.success('Notifier已添加');
          await refreshNotifiers();
        } else {
          message.error('添加Notifier失败');
        }
      } catch (err) {
        message.error('添加Notifier时发生错误');
      } finally {
        loading.value = false;
      }
    }
  })
}

const removeNotifier = (id: string) => {
  const notifier = notifiers.value?.find(it => it.id === id);
  if (!notifier) return;
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除Agent "${notifier.name}" 吗？`,
    async onOk() {
      try {
        loading.value = true;
        const {error} = await useApi(`/api/notifier/${notifier.id}`).delete().json();

        if (!error.value) {
          message.success('Notifier已删除');
          await refreshNotifiers();
        } else {
          message.error('删除Notifier失败');
        }
      } catch (err) {
        message.error('删除Notifier时发生错误');
      } finally {
        loading.value = false;
      }
    }
  })
}

const editNotifier = (id: string) => {
  const notifier = notifiers.value?.find(it => it.id === id);
  if (!notifier) return;
  const notifierConfig = ref(notifier)
  Modal.confirm({
    title: '编辑通知配置',
    content: h(NotifierForm, {
      modelValue: notifierConfig.value,
      'onUpdate:modelValue': (val: NotifierConfig) => notifierConfig.value = val,
    }),
    async onOk() {
      try {
        loading.value = true;
        // 通过API更新Agent
        const {error} = await useApi(`/api/notifier/${notifierConfig.value.id}`).post(notifierConfig.value).json();

        if (!error.value) {
          message.success('Notifier已更新');
          await refreshNotifiers();
        } else {
          message.error('更新Notifier失败');
        }
      } catch (err) {
        message.error('更新Notifier时发生错误');
      } finally {
        loading.value = false;
      }
    }
  })
}

const testNotifier = async (id: string) => {
  const notifier = notifiers.value?.find(it => it.id === id);
  if (!notifier) return;
  try {
    testing.value = true;
    const {error} = await useApi(`/api/notifier/${notifier.id}/test`).post().json();

    if (!error.value) {
      message.success('Notifier连接测试成功');
    } else {
      message.error('Notifier连接测试失败');
    }
  } catch (err) {
    message.error('测试Notifier连接时发生错误');
  } finally {
    testing.value = false;
  }
}
</script>

<template>
  <div class="flex-col h-full space-y-4">
    <h3 class="text-lg font-medium">通知配置</h3>

    <a-form layout="vertical" class="max-w-2xl">
      <a-form-item label="启用通知">
        <a-switch
          :checked="systemConfig.notifications.enabled"
          @change="checked => {
            const newNotifyConfig = { ...systemConfig.notifications, enabled: !!checked };
            updateConfig({ notifications: newNotifyConfig });
        }"/>
        <span class="ml-2 text-gray-500">是否启用消息通知功能</span>
      </a-form-item>
    </a-form>
    <div v-if="systemConfig.notifications.enabled" class="flex-col flex-1">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-md font-medium">已配置的通知</h4>
        <a-button type="primary" @click="addNotifier" :loading="loading">
          <PlusOutlined/>
          添加通知
        </a-button>
      </div>
      <div v-if="notifiers && notifiers.length > 0" class="flex-1 h-0 space-y-3 overflow-auto">
        <div
          v-for="notifier in notifiers"
          :key="notifier.id"
          class="border border-gray-200 rounded p-4 bg-white hover:border-blue-300 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex gap-2.5">
              <div>{{ notifier.name }}</div>
              <div>提供商: {{ notifier.type }}</div>
            </div>
            <div class="flex gap-2 ml-4">
              <a-button
                type="primary"
                size="small"
                @click="editNotifier(notifier.id)"
                :disabled="testing"
              >
                编辑
              </a-button>
              <a-button
                type="default"
                size="small"
                @click="testNotifier(notifier.id)"
                :loading="testing"
              >
                <ThunderboltOutlined/>
                测试
              </a-button>
              <a-button
                type="text"
                danger
                size="small"
                @click="removeNotifier(notifier.id)"
                :disabled="testing"
              >
                <DeleteOutlined/>
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 border border-dashed border-gray-300 rounded">
        <p class="text-gray-500 mb-4">尚未配置任何通知</p>
        <a-button type="primary" @click="addNotifier">
          <PlusOutlined/>
          添加第一个通知
        </a-button>
      </div>
    </div>
  </div>
</template>
