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
          return Promise.reject();
        }
      } catch (err) {
        message.error('添加时发生错误');
        return Promise.reject();
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
          return Promise.reject();
        }
      } catch (err) {
        message.error('更新时发生错误');
        return Promise.reject();
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
    <h3 class="text-lg font-medium">
      通知配置
    </h3>

    <a-form layout="vertical" class="max-w-2xl">
      <a-form-item label="启用通知">
        <a-switch
          :checked="systemConfig.notifications.enabled"
          @change="checked => {
            const newNotifyConfig = { ...systemConfig.notifications, enabled: !!checked };
            updateConfig({ notifications: newNotifyConfig });
          }"
        />
        <span class="ml-2 text-gray-500">是否启用消息通知功能</span>
      </a-form-item>
      <a-form-item label="通知阈值" tooltip="大于指定值才会通知，设为 0 通知所有">
        <a-slider
          class="w-72"
          :min="0"
          :max="100"
          :step="1"
          :value="systemConfig.notifications.threshold ?? 60"
          @change="value => {
            const newNotifyConfig = { ...systemConfig.notifications, threshold: value as number };
            updateConfig({ notifications: newNotifyConfig });
          }"
        />
      </a-form-item>
    </a-form>
    <div v-if="systemConfig.notifications.enabled" class="flex-col flex-1 h-0">
      <div class="flex-y-center justify-between mb-4">
        <h4 class="text-md font-medium">
          已配置的通知
        </h4>
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
          <div class="flex-col sm:flex-row justify-between items-start sm:items-center">
            <div class="flex items-start gap-3 w-full sm:w-auto">
              <div class="flex-y-center h-6">
                <a-switch :checked="notifier.enable" size="small" @change="toggleNotifier(notifier.id)"/>
              </div>

              <div class="flex-col gap-1 flex-1">
                <div class="flex-y-center flex-wrap gap-2">
                  <span class="text-base font-medium text-[rgba(0,0,0,0.85)]">{{ notifier.name }}</span>
                  <a-tag :color="getColor(notifier.id)" class="m-0">
                    {{ getText(notifier.id) }}
                  </a-tag>
                </div>
                <div class="text-[rgba(0,0,0,0.45)] text-sm">
                  提供商: <span class="text-[rgba(0,0,0,0.65)]">{{ notifier.type }}</span>
                </div>
              </div>
            </div>

            <div class="flex-y-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
              <a-button
                type="primary"
                size="small"
                class="flex-1 sm:flex-none"
                :disabled="isTesting(notifier.id)"
                @click="editNotifier(notifier.id)"
              >
                编辑
              </a-button>

              <a-button
                type="default"
                size="small"
                class="flex-1 sm:flex-none inline-flex items-center justify-center"
                :loading="isTesting(notifier.id)"
                @click="testNotifier(notifier.id)"
              >
                <template #icon>
                  <ThunderboltOutlined/>
                </template>
                测试
              </a-button>

              <a-button
                type="text"
                danger
                size="small"
                class="px-2"
                :disabled="isTesting(notifier.id)"
                @click="removeNotifier(notifier.id)"
              >
                <template #icon>
                  <DeleteOutlined/>
                </template>
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 border border-dashed border-gray-300 rounded">
        <p class="text-gray-500 mb-4">
          尚未配置任何通知
        </p>
        <a-button type="primary" @click="addNotifier">
          <PlusOutlined/>
          添加第一个通知
        </a-button>
      </div>
    </div>
  </div>
</template>
