<script setup lang="ts">
import {defineProps, reactive} from 'vue'

import type {Task} from '@/api/task'

const props = defineProps<{ task: Task }>()

const form = reactive({
  task_name: props.task.task_name,
  keyword: props.task.keyword,
  max_pages: props.task.max_pages,
  personal_only: props.task.personal_only,
  min_price: props.task.min_price,
  max_price: props.task.max_price,
  cron: props.task.cron,
  description: props.task.description,
  enabled: props.task.enabled,
})
</script>

<template>
  <a-form
    :model="form"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
  >
    <a-form-item label="任务名称" required>
      <a-input v-model:value="form.task_name" placeholder="请输入任务名称"/>
    </a-form-item>

    <a-form-item label="关键词" required>
      <a-input v-model:value="form.keyword" placeholder="请输入关键词"/>
    </a-form-item>

    <a-form-item label="最大页数">
      <a-input-number v-model:value="form.max_pages" :min="1" style="width: 100%"/>
    </a-form-item>

    <a-form-item label="仅个人">
      <a-checkbox v-model:checked="form.personal_only"/>
    </a-form-item>

    <a-form-item label="最小价格">
      <a-input-number v-model:value="form.min_price" :min="0" style="width: 100%"/>
    </a-form-item>

    <a-form-item label="最大价格">
      <a-input-number v-model:value="form.max_price" :min="0" style="width: 100%"/>
    </a-form-item>

    <a-form-item label="定时任务" required>
      <a-input v-model:value="form.cron" placeholder="cron 表达式"/>
    </a-form-item>

    <a-form-item label="描述">
      <a-textarea v-model:value="form.description" :rows="4" placeholder="请输入描述"/>
    </a-form-item>

    <a-form-item label="启用">
      <a-switch v-model:checked="form.enabled"/>
    </a-form-item>
  </a-form>
</template>
