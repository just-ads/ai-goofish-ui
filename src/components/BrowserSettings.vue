<script setup lang="ts">
import {WarningOutlined} from '@ant-design/icons-vue'
import type {SystemConfig} from '@/types/system';

const props = defineProps<{
  config: SystemConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: SystemConfig): void;
}>();

const systemConfig = computed(() => props.config);

// 更新配置的辅助函数
const updateConfig = (updates: Partial<SystemConfig>) => {
  const newConfig = {...systemConfig.value, ...updates};
  emit('update:config', newConfig);
};
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium">浏览器配置</h3>
    <div class="space-x-2 text-orange">
      <WarningOutlined />
      <span>docker 环境下将忽略以下设置</span>
    </div>

    <a-form layout="vertical" class="max-w-2xl">
      <a-form-item label="无头模式">
        <a-switch
          :checked="systemConfig.browser.headless"
          @change="(checked) => {
            const newConfig = { ...systemConfig.browser, headless: !!checked };
            updateConfig({ browser: newConfig });
          }"/>
        <span class="ml-2 text-gray-500">是否在后台运行浏览器</span>
      </a-form-item>

      <a-form-item label="浏览器类型">
        <a-select
          :value="systemConfig.browser.channel"
          class="w-full"
          @change="channel => {
            const newConfig = { ...systemConfig.browser, channel: channel as any };
            updateConfig({ browser: newConfig });
          }">
          <a-select-option value="chrome">Chrome</a-select-option>
          <a-select-option value="firefox">Firefox</a-select-option>
          <a-select-option value="webkit">WebKit</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>
