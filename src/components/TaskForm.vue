<script setup lang="ts" generic="T extends Task">
import {QuestionCircleTwoTone} from '@ant-design/icons-vue'

import type {Task} from "@/types/task";

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
  <a-form ref="formRef" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
    <a-form-item
      label="任务名称"
      :rules="[{ required: true, message: '请输入任务名称' }]"
    >
      <a-input v-model:value="form.task_name"/>
    </a-form-item>

    <a-form-item
      label="关键词"
      :rules="[{ required: true, message: '请输入搜索关键词' }]"
    >
      <a-input v-model:value="form.keyword"/>
    </a-form-item>

    <a-form-item label="最大页数">
      <a-input-number v-model:value="form.max_pages" :min="1" style="width: 100%"/>
    </a-form-item>

    <a-form-item label="仅个人">
      <a-checkbox v-model:checked="form.personal_only">
        仅个人
      </a-checkbox>
    </a-form-item>

    <a-form-item label="最小价格">
      <a-input-number stringMode v-model:value="form.min_price" :min="0" style="width: 100%"/>
    </a-form-item>

    <a-form-item label="最大价格">
      <a-input-number stringMode v-model:value="form.max_price" :min="0" style="width: 100%"/>
    </a-form-item>

    <a-form-item
      label="定时任务"
      :rules="[{ required: true, message: '请输入定时规则' }]"
    >
      <template #tooltip>
        <a-tooltip>
          <QuestionCircleTwoTone/>
          <template #title>
            <p>CRON表达式</p>
            <p>分 时 日 月 星期</p>
            <p>* 表示任意时间</p>
            <p>例如</p>
            <p>0 3 * * * 表示每日3点触发</p>
            <p>0 3 5 * * 表示每月5日3点触发</p>
          </template>
        </a-tooltip>
      </template>
      <a-input v-model:value="form.cron" placeholder="CRON表达式"/>
    </a-form-item>

    <a-form-item
      label="详细需求"
      :rules="[{ required: true, message: '请输入商品的详细需求' }]"
    >
      <a-textarea v-model:value="form.description" :rows="4"/>
    </a-form-item>

    <a-form-item label="启用">
      <a-switch v-model:checked="form.enabled"/>
    </a-form-item>
  </a-form>
</template>
