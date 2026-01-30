<script setup lang="ts">
import {useApi} from "@/api/fetch";
import type {SystemConfig} from "@/types/system";
import type {AIConfig} from "@/types/ai";

const props = defineProps<{
  config: SystemConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: SystemConfig): void;
}>();

const systemConfig = computed(() => props.config);


const {data: aiConfigList} = useApi<AIConfig[]>('/api/ai', {
  initialData: []
}).json<AIConfig[]>();

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
        <a-form-item label="文本分析 AI">
          <a-select
            :value="systemConfig.evaluator.textAI || undefined"
            @change="(value) => {
              const newEvaluator = { ...systemConfig.evaluator, textAI: value as string || null };
              updateConfig({ evaluator: newEvaluator });
            }"
            class="w-full"
            placeholder="选择用于文本分析的 AI"
            allow-clear
          >
            <a-select-option
              v-for="config in aiConfigList"
              :key="config.id"
              :value="config.id"
            >
              {{ config.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="图像分析 AI" tooltip="支持多模态的模型">
          <a-select
            :value="systemConfig.evaluator.imageAI || undefined"
            @change="(value) => {
              const newEvaluator = { ...systemConfig.evaluator, imageAI: value as string || null };
              updateConfig({ evaluator: newEvaluator });
            }"
            class="w-full"
            placeholder="未启用"
            allow-clear
          >
            <a-select-option
              v-for="config in aiConfigList"
              :disabled="!config.multimodal"
              :key="config.id"
              :value="config.id"
            >
              {{ config.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>
