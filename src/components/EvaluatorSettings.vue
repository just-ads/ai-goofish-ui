<script setup lang="ts">
import {useApi} from "@/api/fetch";
import type {SystemConfig} from "@/types/system";
import type {ProviderConfig} from "@/types/provider";

const props = defineProps<{
  config: SystemConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: SystemConfig): void;
}>();

const systemConfig = computed(() => props.config);

// 获取Agent列表
const {data: providers} = useApi<ProviderConfig[]>('/api/providers', {
  initialData: []
}).json<ProviderConfig[]>();

// 更新配置的辅助函数
const updateConfig = (updates: Partial<SystemConfig>) => {
  const newConfig = {...systemConfig.value, ...updates};
  emit('update:config', newConfig);
};
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium">商品评估器配置</h3>

    <a-form layout="vertical" class="max-w-2xl">
      <a-form-item label="启用评估器">
        <a-switch
          :checked="systemConfig.evaluator.enabled"
          @change="(checked) => {
            const newEvaluator = { ...systemConfig.evaluator, enabled: !!checked };
            updateConfig({ evaluator: newEvaluator });
          }"
        />
        <span class="ml-2 text-gray-500">是否启用AI商品分析评估</span>
      </a-form-item>

      <div v-if="systemConfig.evaluator.enabled">
        <a-form-item label="文本分析Provider">
          <a-select
            :value="systemConfig.evaluator.textProvider || undefined"
            @change="(value) => {
              const newEvaluator = { ...systemConfig.evaluator, textProvider: value as string || null };
              updateConfig({ evaluator: newEvaluator });
            }"
            class="w-full"
            placeholder="选择用于文本分析的Provider"
            allow-clear
          >
            <a-select-option
              v-for="provider in providers"
              :key="provider.id"
              :value="provider.id"
            >
              {{ provider.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="图像分析Provider">
          <a-select
            :value="systemConfig.evaluator.imageProvider || undefined"
            @change="(value) => {
              const newEvaluator = { ...systemConfig.evaluator, imageProvider: value as string || null };
              updateConfig({ evaluator: newEvaluator });
            }"
            class="w-full"
            placeholder="选择用于图像分析的Provider"
            allow-clear
          >
            <a-select-option
              v-for="provider in providers"
              :key="provider.id"
              :value="provider.id"
            >
              {{ provider.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>
