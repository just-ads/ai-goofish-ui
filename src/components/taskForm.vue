<script setup lang="ts" generic="T extends Task">
import {defineProps, defineEmits, reactive, watch} from 'vue'
import type {Task} from '@/api/task'

const props = defineProps<{ modelValue: T }>()
const emit = defineEmits<{
  (e: "update:modelValue", value: T): void
}>();

const form = reactive({...props.modelValue})

watch(
  form,
  () => {
    // @ts-expect-error
    emit('update:modelValue', {...form})
  },
  {deep: true}
)
</script>

<template>
  <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
    <a-form-item label="任务名称" required>
      <a-input v-model:value="form.task_name"/>
    </a-form-item>

    <a-form-item label="关键词" required>
      <a-input v-model:value="form.keyword"/>
    </a-form-item>

    <a-form-item label="最大页数">
      <a-input-number v-model:value="form.max_pages" :min="1" style="width: 100%"/>
    </a-form-item>

    <a-form-item label="仅个人">
      <a-checkbox v-model:checked="form.personal_only">仅个人</a-checkbox>
    </a-form-item>

    <a-form-item label="最小价格">
      <a-input-number stringMode v-model:value="form.min_price" :min="0" style="width: 100%"/>
    </a-form-item>

    <a-form-item label="最大价格">
      <a-input-number stringMode v-model:value="form.max_price" :min="0" style="width: 100%"/>
    </a-form-item>

    <a-form-item label="定时任务" required>
      <a-input v-model:value="form.cron"/>
    </a-form-item>

    <a-form-item label="描述" required>
      <a-textarea v-model:value="form.description" :rows="4"/>
    </a-form-item>

    <a-form-item label="启用">
      <a-switch v-model:checked="form.enabled"/>
    </a-form-item>
  </a-form>
</template>
