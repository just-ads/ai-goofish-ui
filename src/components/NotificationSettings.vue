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
const testingMap = reactive(new Map<string, 'testing' | 'success' | 'failure'>());

const systemConfig = computed(() => props.config);


const updateConfig = (updates: Partial<SystemConfig>) => {
  const newConfig = {...systemConfig.value, ...updates};
  emit('update:config', newConfig);
};

const addNotifier = () => {
  const notifierConfig = ref<NotifierConfig>({
    id: '',
    type: 'ntfy',
    name: '通知1',
    enable: true,
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
        const {error} = await useApi('/api/notifier').post(newNotifier).json();
        if (!error.value) {
          message.success('已添加');
          await refreshNotifiers();
        } else {
          message.error('添加失败');
        }
      } catch (err) {
        message.error('添加时发生错误');
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
    content: `确定要删除 "${notifier.name}" 吗？`,
    async onOk() {
      try {
        loading.value = true;
        const {error} = await useApi(`/api/notifier/${notifier.id}`).delete().json();

        if (!error.value) {
          message.success('已删除');
          await refreshNotifiers();
        } else {
          message.error('删除失败');
        }
      } catch (err) {
        message.error('删除时发生错误');
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
      hideTemplate: true,
      'onUpdate:modelValue': (val: NotifierConfig) => notifierConfig.value = val,
    }),
    async onOk() {
      try {
        loading.value = true;
        const {error} = await useApi(`/api/notifier/${notifierConfig.value.id}`).post(notifierConfig.value).json();
        if (!error.value) {
          message.success('已更新');
          await refreshNotifiers();
        } else {
          message.error('更新失败');
        }
      } catch (err) {
        message.error('更新时发生错误');
      } finally {
        loading.value = false;
      }
    }
  })
}

const toggleNotifier = async (id: string) => {
  const notifier = notifiers.value?.find(it => it.id === id);
  if (!notifier) return;
  try {
    loading.value = true;
    const {error} = await useApi(`/api/notifier/${id}`).post({...notifier, enable: !notifier.enable}).json();
    if (!error.value) {
      message.success(notifier.enable ? '已禁用' : '已启用');
      await refreshNotifiers();
    } else {
      message.error('请求失败');
    }
  } catch (err) {
    message.error('请求时发生错误');
  } finally {
    loading.value = false;
  }
}

const testNotifier = async (id: string) => {
  const notifier = notifiers.value?.find(it => it.id === id);
  if (!notifier) return;
  testingMap.set(id, 'testing')
  try {
    const {error} = await useApi(`/api/notifier/${notifier.id}/test`).post().json();

    if (!error.value) {
      testingMap.set(id, 'success')
      message.success('Notifier连接测试成功');
    } else {
      testingMap.set(id, 'failure')
      message.error('Notifier连接测试失败');
    }
  } catch (err) {
    testingMap.set(id, 'failure')
    message.error('测试Notifier连接时发生错误');
  }
}

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
    <div v-if="systemConfig.notifications.enabled" class="flex-col flex-1 h-0">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-md font-medium">已配置的通知</h4>
        <a-button type="primary" @click="addNotifier">
          <PlusOutlined/>
          添加通知
        </a-button>
      </div>
      <div v-if="notifiers && notifiers.length > 0" class="flex-1 h-0 space-y-3 overflow-auto">
        <div
          v-for="notifier in notifiers"
          :key="notifier.id"
          class="border border-gray-200 rounded p-4 bg-blueGray  hover:border-blue-300 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex gap-2.5">
              <a-tag :color="getColor(notifier.id)">{{ getText(notifier.id) }}</a-tag>
              <a-switch :checked="notifier.enable" @change="toggleNotifier(notifier.id)"/>
              <div>{{ notifier.name }}</div>
              <div>提供商: {{ notifier.type }}</div>
            </div>
            <div class="flex gap-2 ml-4">
              <a-button
                type="primary"
                size="small"
                @click="editNotifier(notifier.id)"
                :disabled="isTesting(notifier.id)"
              >
                编辑
              </a-button>
              <a-button
                type="default"
                size="small"
                @click="testNotifier(notifier.id)"
                :loading="isTesting(notifier.id)"
              >
                <ThunderboltOutlined/>
                测试
              </a-button>
              <a-button
                type="text"
                danger
                size="small"
                @click="removeNotifier(notifier.id)"
                :disabled="isTesting(notifier.id)"
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
