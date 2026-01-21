<script setup lang="ts" generic="T extends NotifierConfig">

import {useApi} from "@/api/fetch";
import {NotifierConfig, NotifierTemplate} from "@/types/notifier";
import {ThunderboltOutlined, InfoCircleOutlined} from "@ant-design/icons-vue";
import {message} from "ant-design-vue";

const props = defineProps<{ modelValue: T }>()
const emit = defineEmits<{
  (e: "update:modelValue", value: T): void
}>();

// Avoid TS2862: reactive<T> generic index writes
const form = reactive<NotifierConfig>({ ...props.modelValue })

const testing = ref(false);
const testResult = ref<string | null>(null);
const testVisible = ref(false);

const {data: notifierTemplates} = useApi('/api/notifier/templates').json<NotifierTemplate[]>();

watch(
  form,
  () => {
    emit('update:modelValue', {...form} as T)
  },
  {deep: true}
)

const getTemplateByType = (type: string) => {
  return notifierTemplates.value?.find(t => t.type === type);
}

const applyTemplate = (type: string) => {
  if (!type) return;
  const template = getTemplateByType(type);
  if (!template) {
    return message.error('未找到该类型的模板')
  }

  form.type = template.type;

  if (template.template) {
    Object.entries(template.template).forEach(([key, fieldDef]) => {
      if (fieldDef.default !== undefined) {
        form[key] = fieldDef.default;
      }
    });
  }
}

const currentTemplateFields = computed(() => {
  if (!form.type) return {};
  const template = getTemplateByType(form.type);
  return template?.template || {};
})

const testNotifier = async () => {
  const missingFields = [];
  if (!form.name) missingFields.push('通知名称');
  if (!form.type) missingFields.push('通知类型');

  const template = getTemplateByType(form.type);
  if (template?.template) {
    Object.entries(template.template).forEach(([key, fieldDef]) => {
      if (fieldDef.required && !form[key]) {
        missingFields.push(fieldDef.name);
      }
    });
  }

  if (missingFields.length > 0) {
    message.error(`请填写以下必填字段：${missingFields.join('、')}`);
    return;
  }

  try {
    testing.value = true;
    testResult.value = null;

    const {error: testError} = await useApi(`/api/notifier/test`).post(form).json();

    if (!testError.value) {
      const response = '测试成功';
      const notifierName = form.name;

      testResult.value = `✅ 通知连接测试成功！\n\n` +
        `通知名称: ${notifierName}\n` +
        `通知类型: ${form.type}\n` +
        `测试响应: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`;
      message.success('通知连接测试成功');
    } else {
      testResult.value = `❌ 通知连接测试失败\n\n` +
        `错误信息: ${testError.value?.message || '未知错误'}\n` +
        `可能原因:\n` +
        `1. 配置信息错误\n` +
        `2. 通知服务无法访问\n` +
        `3. 网络连接问题`;
      message.error('通知连接测试失败');
    }

    testVisible.value = true;
  } catch (err: any) {
    testResult.value = `❌ 测试过程中发生错误\n\n` +
      `错误信息: ${err.message || '未知错误'}\n` +
      `可能原因:\n` +
      `1. 网络连接中断\n` +
      `2. 服务器无响应\n` +
      `3. 请求超时`;
    message.error('测试过程中发生错误');
    testVisible.value = true;
  } finally {
    testing.value = false;
  }
}

const closeTestResult = () => {
  testVisible.value = false;
  testResult.value = null;
}

// 暴露测试方法给父组件
defineExpose({
  testNotifier,
  testing,
  testResult,
  testVisible
});
</script>

<template>
  <div class="space-y-4">
    <a-form
      :model="form"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="通知名称" name="name" required>
        <a-input v-model:value="form.name" placeholder="输入通知名称"/>
      </a-form-item>

      <a-form-item label="通知类型" name="type" required>
        <a-select
          placeholder="选择通知类型"
          v-model:value="form.type"
          @change="applyTemplate"
          allow-clear
        >
          <a-select-option
            v-for="template in notifierTemplates"
            :key="template.type"
            :value="template.type"
          >
            {{ template.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 动态字段 -->
      <template v-if="form.type && currentTemplateFields">
        <a-form-item
          v-for="(fieldDef, fieldName) in currentTemplateFields"
          :key="fieldName"
          :label="fieldDef.name"
          :name="fieldName"
          :required="fieldDef.required"
        >
          <template v-if="fieldDef.type === 'password'">
            <a-input-password
              v-model:value="form[fieldName]"
              :placeholder="fieldDef.placeholder || `输入${fieldDef.name}`"
            />
          </template>
          <template v-else-if="fieldDef.type === 'number'">
            <a-input-number
              v-model:value="form[fieldName]"
              :placeholder="fieldDef.placeholder || `输入${fieldDef.name}`"
              style="width: 100%"
            />
          </template>
          <template v-else>
            <a-input
              v-model:value="form[fieldName]"
              :placeholder="fieldDef.placeholder || `输入${fieldDef.name}`"
            />
          </template>
        </a-form-item>
      </template>

      <!-- 操作按钮行 -->
      <a-form-item :wrapper-col="{ offset: 5, span: 18 }">
        <div class="flex items-center pt-4 border-t border-gray-200">
          <!-- 左侧：测试按钮 -->
          <div class="flex items-center gap-2">
            <a-button
              type="primary"
              @click="testNotifier"
              :loading="testing"
              :disabled="!form.name || !form.type"
            >
              <ThunderboltOutlined/>
              测试连接
            </a-button>

            <a-tooltip v-if="!form.name || !form.type">
              <template #title>
                <div class="text-xs">
                  <div v-if="!form.name">请填写通知名称</div>
                  <div v-if="!form.type">请选择通知类型</div>
                </div>
              </template>
              <InfoCircleOutlined class="text-gray-400"/>
            </a-tooltip>
          </div>

          <!-- 右侧：提示信息 -->
          <span class="text-gray-500 text-sm">
              测试通过后再保存
            </span>
        </div>
      </a-form-item>

      <!-- 测试结果（显示在操作按钮行下方） -->
      <a-form-item v-if="testVisible" :wrapper-col="{ offset: 5, span: 18 }">
        <div class="mt-2 p-4 border rounded" :class="testResult?.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-medium" :class="testResult?.includes('✅') ? 'text-green-700' : 'text-red-700'">
              {{ testResult?.includes('✅') ? '✅ 测试成功' : '❌ 测试失败' }}
            </h4>
            <a-button type="text" size="small" @click="closeTestResult">
              关闭
            </a-button>
          </div>
          <div class="text-sm whitespace-pre-wrap font-mono bg-white/50 p-3 rounded">
            <div v-if="testResult?.includes('✅')" class="space-y-2">
              <div class="text-green-700 font-medium">配置验证通过！</div>
              <div class="text-gray-700">{{ testResult.replace('✅ 通知连接测试成功！\n\n', '') }}</div>
            </div>
            <div v-else class="space-y-2">
              <div class="text-red-700 font-medium">配置验证失败</div>
              <div class="text-gray-700">{{ testResult?.replace('❌ ', '') }}</div>
              <div class="text-gray-600 text-xs mt-2">
                请检查以下配置：
                <ul class="list-disc pl-4 mt-1">
                  <li>通知类型是否正确</li>
                  <li>配置信息是否完整</li>
                  <li>网络连接是否正常</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>
