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
    <h3 class="text-lg font-medium">浏览器配置</h3>

    <a-form layout="vertical" class="max-w-2xl">
      <a-form-item label="无头模式">
        <a-switch v-model:checked="systemConfig.browser.headless" />
        <span class="ml-2 text-gray-500">是否在后台运行浏览器</span>
      </a-form-item>

      <a-form-item label="浏览器类型">
        <a-select v-model:value="systemConfig.browser.channel" class="w-full">
          <a-select-option value="chrome">Chrome</a-select-option>
          <a-select-option value="firefox">Firefox</a-select-option>
          <a-select-option value="webkit">WebKit</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>