<script setup lang="ts">
import type { SystemConfig } from "@/types/system";

const props = defineProps<{
  config: SystemConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: SystemConfig): void;
}>();

const systemConfig = computed(() => props.config);

// 更新配置的辅助函数
const updateConfig = (updates: Partial<SystemConfig>) => {
  const newConfig = { ...systemConfig.value, ...updates };
  emit('update:config', newConfig);
};
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium">通知配置</h3>

    <a-form layout="vertical" class="max-w-2xl">
      <a-form-item label="启用通知">
        <a-switch v-model:checked="systemConfig.notifications.enabled" />
        <span class="ml-2 text-gray-500">是否启用消息通知功能</span>
      </a-form-item>

      <div v-if="systemConfig.notifications.enabled">
        <!-- 通知提供商配置区域 -->
        <div class="mt-4 p-4 border border-gray-200 rounded">
          <p class="text-gray-500 mb-2">通知功能已启用，但尚未配置提供商。</p>
          <p class="text-sm text-gray-400">支持的通知提供商：ntfy、gotify、wechat</p>
        </div>
      </div>
    </a-form>
  </div>
</template>