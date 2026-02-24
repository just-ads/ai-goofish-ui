<script setup lang="ts">
import {FilterOutlined, PictureOutlined, FileProtectOutlined, VerifiedOutlined} from '@ant-design/icons-vue';
import {useApi} from "@/api/fetch";

import type {EvaluationStep, SystemConfig} from "@/types/system";
import type {AIConfig} from "@/types/ai";

const props = defineProps<{
  config: SystemConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: SystemConfig): void;
}>();

const systemConfig = computed(() => props.config);

const currentSteps = ref<number>(0)
const steps = computed(() => systemConfig.value.evaluator.steps || {})

const defaultPrompts: Record<number, string> = {
  0: '根据商品标题判断是否为需求商品。规则：\n1）标题明确不属于需求商品（如型号、品牌明显不同），建议度直接为0；\n2）标题包含需求商品关键信息但部分规格未明确（如未标明容量、版本），视为相关，给予中等偏上建议度；\n3）标题越接近需求商品完整描述，建议度越高',
  1: '综合商品描述、发布时间等信息评估与需求的符合度。规则：\n1）详情中明确不符合需求（如型号、规格矛盾），建议度直接为0；\n2）其他情况按信息完整性打分，信息越接近需求商品建议度越高；\n3）注意：商品原价可能为0，这属于正常情况，不应视为风险降低建议度。\n建议度低于 {threshold} 将跳过后续评估',
  2: '分析卖家注册时长、历史评价、芝麻信用等信息，评估卖家可信度与交易风险',
  3: '分析商品图片，评估与描述的一致性。规则：\n1）区分商品官方图（渲染图/宣传图）和卖家实拍图，官方图占比大则风险更高；\n2）实拍图中可能包含其他物品，这属于正常情况，除非图片中完全不包含描述中的商品，否则不应降低建议度；\n3）综合图片信息评估商品真实性与可信度',
}

const step = computed<EvaluationStep | null>(() => {
  switch (currentSteps.value) {
    case 0:
      return steps.value.step1 || {threshold: 30, disabled: false}
    case 1:
      return steps.value.step2 || {threshold: 50, disabled: false}
    case 2:
      return steps.value.step3 || {threshold: 50, disabled: false}
    case 3:
      return steps.value.step4 || {threshold: 50, disabled: false}
  }
  return null
})


const {data: aiConfigList} = useApi<AIConfig[]>('/api/ai', {
  initialData: []
}).json<AIConfig[]>();

const updateConfig = (updates: Partial<SystemConfig>) => {
  const newConfig = {...systemConfig.value, ...updates};
  emit('update:config', newConfig);
};

const updateStep = (updates: Partial<EvaluationStep>) => {
  const newStep = {...step.value, ...updates} as EvaluationStep;
  const newSteps = {...systemConfig.value.evaluator.steps}
  switch (currentSteps.value) {
    case 0:
      newSteps['step1'] = newStep
      break;
    case 1:
      newSteps['step2'] = newStep
      break;
    case 2:
      newSteps['step3'] = newStep
      break;
    case 3:
      newSteps['step4'] = newStep
  }
  const newEvaluator = {...systemConfig.value.evaluator, steps: newSteps};
  updateConfig({evaluator: newEvaluator})
}

</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium">
      商品评估器配置
    </h3>

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
            class="w-full"
            placeholder="选择用于文本分析的 AI"
            allow-clear
            @change="(value) => {
              const newEvaluator = { ...systemConfig.evaluator, textAI: value as string || null };
              updateConfig({ evaluator: newEvaluator });
            }"
          >
            <a-select-option
              v-for="it in aiConfigList"
              :key="it.id"
              :value="it.id"
            >
              {{ it.name }}
              <a-tag v-if="it.multimodal" color="success">
                多模态
              </a-tag>
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="图像分析 AI" tooltip="支持多模态的模型">
          <a-select
            :value="systemConfig.evaluator.imageAI || undefined"
            class="w-full"
            placeholder="未启用"
            allow-clear
            @change="(value) => {
              const newEvaluator = { ...systemConfig.evaluator, imageAI: value as string || null };
              updateConfig({ evaluator: newEvaluator });
            }"
          >
            <a-select-option
              v-for="it in aiConfigList"
              :key="it.id"
              :disabled="!it.multimodal"
              :value="it.id"
            >
              {{ it.name }}
              <a-tag v-if="it.multimodal" color="success">
                多模态
              </a-tag>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="AI 评估步骤">
          <a-steps v-model:current="currentSteps" size="small">
            <a-step title="标题过滤" description="使用标题过滤产品">
              <template #icon>
                <FilterOutlined />
              </template>
            </a-step>
            <a-step title="商品详情评估" description="评估商品详细信息">
              <template #icon>
                <FileProtectOutlined />
              </template>
            </a-step>
            <a-step title="卖家评估" description="评估卖家可信度">
              <template #icon>
                <VerifiedOutlined />
              </template>
            </a-step>
            <a-step title="图片评估" description="评估商品质量">
              <template #icon>
                <PictureOutlined />
              </template>
            </a-step>
          </a-steps>
          <div class="mt-2.5 border border-solid rounded border-gray-300/20 p-2.5">
            <a-form-item label="禁用此步骤">
              <a-switch
                :checked="step?.disabled"
                @change="checked => {
                  updateStep({disabled: !!checked})
                }"
              />
            </a-form-item>
            <a-form-item label="触发下一步阈值" tooltip="AI 建议大于此值才会进入下一个步骤">
              <a-slider
                class="w-full sm:w-72"
                :min="0"
                :max="100"
                :step="1"
                :value="step?.threshold"
                @change="value => {
                  updateStep({threshold: value as number})
                }"
              />
            </a-form-item>
            <a-form-item label="自定义 Prompt" tooltip="自定义该步骤的 AI 任务提示词，支持 {threshold} 变量。留空使用默认提示词">
              <a-textarea
                :value="step?.prompt"
                :placeholder="defaultPrompts[currentSteps]"
                :rows="8"
                @change="(e: Event) => {
                  updateStep({prompt: (e.target as HTMLTextAreaElement).value || undefined})
                }"
              />
            </a-form-item>
          </div>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>
