<script setup lang="ts">
import {useTaskStore} from '@/store'

import type {Task} from '@/types/task'

const taskStore = useTaskStore()

interface Props {
  modelValue?: number
  disabled?: boolean
  showSearch?: boolean
  autoSelected?: boolean
  size?: 'small' | 'middle' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择任务',
  disabled: false,
  showSearch: true,
  autoSelected: true,
  size: 'middle'
})

const selectedTask = ref<Task>()
const selectedTaskId = computed(() => {
  if (props.modelValue !== undefined) return props.modelValue
  return selectedTask.value?.task_id
})

const emit = defineEmits<{
  (e: 'update:modelValue', value?: number): void
  (e: 'change', value?: number, task?: Task): void
}>()

const handleChange = (id: any) => {
  const task = taskStore.tasks.find(task => task.task_id === id)
  const taskId = task?.task_id
  selectedTask.value = task
  emit('update:modelValue', taskId)
  emit('change', taskId, task)
}

const antoSelected = () => {
  const tasks = taskStore.tasks;
  if (props.autoSelected && !selectedTask.value && tasks[0]) {
    handleChange(tasks[0].task_id)
  }
}


watch(
  () => taskStore.tasks,
  antoSelected
)

onMounted(() => {
  antoSelected();
})

</script>

<template>
  <a-select
    :value="selectedTaskId"
    :show-search="showSearch"
    :size="size"
    @change="handleChange"
    style="width: 100%"
  >
    <a-select-option
      v-for="task in taskStore.tasks"
      :key="task.task_id"
      :value="task.task_id"
      :label="`${task.task_name}`"
    >
      {{ task.task_name }}
    </a-select-option>
  </a-select>
</template>
