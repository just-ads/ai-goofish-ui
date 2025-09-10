<script setup lang="ts">
import {getTasks, updateTask} from '@/api/task'
import TaskEditor from "@/components/taskEditor.vue";
import {message, Modal} from 'ant-design-vue'
import {onMounted, ref} from 'vue'

import type {Task} from '@/api/task'

const tasks = ref<Task[]>([])
const loading = ref(false)

const fetchTasks = async () => {
  loading.value = true
  try {
    tasks.value = await getTasks()
  } catch (err) {
    message.error('任务获取失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchTasks)

const toggleTaskEnabled = async (task: Task) => {
  try {
    // await axios.put(`/api/tasks/${task.task_id}`, { enabled: !task.enabled })
    task.enabled = !task.enabled
    message.success('任务状态已更新')
  } catch (err) {
    message.error('更新失败')
  }
}

const togglePersonalOnly = async (task: Task, checked: boolean) => {
  try {
    console.log(checked)
    // 这里可以调用接口 PUT /api/tasks/{id} 更新 personal_only
    // await axios.put(`/api/tasks/${task.task_id}`, { personal_only: checked })
    task.personal_only = checked
    message.success('任务“仅个人”状态已更新')
  } catch (err) {
    message.error('更新失败')
  }
}


const editTask = (task: Task) => {
  let editedTask = {...task}

  Modal.confirm({
    title: '编辑任务',
    content: h(TaskEditor, {task: editedTask}),
    async onOk() {
      try {
        await updateTask(editedTask);
        Object.assign(task, editedTask)
        message.success('任务更新成功')
      } catch (err) {
        message.error('更新失败')
      }
    }
  })
}

const deleteTask = (id: number) => {
  Modal.confirm({
    title: '确认删除任务？',
    async onOk() {
      try {
        // 这里可以调用接口 DELETE /api/tasks/{id}
        tasks.value = tasks.value.filter(t => t.task_id !== id)
        message.success('任务删除成功')
      } catch (err) {
        message.error('删除失败')
      }
    }
  })
}

const runTask = async (task: Task) => {
  try {
    // 调用接口立即执行任务，例如：
    // await axios.post(`/api/tasks/${task.task_id}/run`)
    message.success(`任务 "${task.task_name}" 已触发运行`)
  } catch (err) {
    message.error('运行失败')
  }
}


</script>

<template>
  <div class="p-4 bg-white h-full">
    <h2 class="text-lg font-bold mb-4">任务管理</h2>
    <a-table :data-source="tasks" :loading="loading" row-key="task_id" :pagination="false" bordered>
      <a-table-column title="启用" key="enabled">
        <template #default="{ record }">
          <a-switch :checked="record.enabled" @change="() => toggleTaskEnabled(record)"/>
        </template>
      </a-table-column>
      <a-table-column title="任务名称" dataIndex="task_name" key="task_name"/>
      <a-table-column title="关键词" dataIndex="keyword" key="keyword"/>
      <a-table-column title="最大页数" dataIndex="max_pages" key="max_pages"/>
      <a-table-column title="仅个人" key="personal_only">
        <template #default="{ record }">
          <a-checkbox
            :checked="record.personal_only"
            @change="checked => togglePersonalOnly(record, checked)"
          />
        </template>
      </a-table-column>

      <a-table-column title="最小价格" dataIndex="min_price" key="min_price"/>
      <a-table-column title="最大价格" dataIndex="max_price" key="max_price"/>
      <a-table-column title="定时任务" dataIndex="cron" key="cron"/>
      <a-table-column title="描述" dataIndex="description" key="description">
        <template #default="{ text }">
          <a-tooltip :title="text">
            <span class="block w-10 truncate">{{ text }}</span>
          </a-tooltip>
        </template>
      </a-table-column>
      <a-table-column title="操作" key="action">
        <template #default="{ record }">
          <a-button type="link" @click="() => editTask(record)">编辑</a-button>
          <a-button type="link" danger @click="() => deleteTask(record.task_id)">删除</a-button>
          <a-button
            type="link"
            :disabled="!record.enabled"
            @click="() => runTask(record)"
          >
            运行
          </a-button>
        </template>
      </a-table-column>

    </a-table>
  </div>
</template>
