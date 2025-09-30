<script setup lang="ts">
import {useApi} from "@/api/fetch";
import TaskForm from "@/components/taskForm.vue";
import {useTaskStore} from "@/store";
import {message, Modal} from 'ant-design-vue'

import type {Task, UpdateTask} from "@/types/task";

const taskStore = useTaskStore();
const loading = ref(false);
let heartbeatTimer: number

const fetchTasks = async () => {
  loading.value = true;
  const {data, error} = await useApi('/api/tasks').json<Task[]>();
  loading.value = false;
  if (!error.value && data.value) {
    taskStore.setTasks(data.value);
  }
}

const updateTask = async (task: UpdateTask) => {
  const {data, error} = await useApi(`/api/tasks/update`).post(task).json<Task>();
  if (data.value && !error.value) {
    taskStore.updateTask(data.value);
    message.success('任务状态已更新')
  }
}

const heartbeat = async () => {
  const runningTasks = taskStore.tasks.filter(it => it.running);
  if (!runningTasks.length) return;
  const {data, error} = await useApi(`/api/tasks/status`).json();
  if (error.value || !data.value) return;
  for (let i = 0; i < runningTasks.length; i++) {
    runningTasks[i].running = data.value[runningTasks[i].task_id];
  }
  heartbeatTimer = window.setTimeout(heartbeat, 2000);
}

const toggleTaskEnabled = (task: Task) => {
  updateTask({task_id: task.task_id, enabled: !task.enabled});
}

const togglePersonalOnly = (task: Task, checked: boolean) => {
  updateTask({task_id: task.task_id, personal_only: checked});
}

const createTask = () => {
  const task = ref<Omit<Task, 'task_id'>>({
    cron: "",
    description: "",
    enabled: true,
    keyword: "",
    max_pages: 1,
    max_price: "",
    min_price: "",
    personal_only: false,
    task_name: ""
  });
  Modal.confirm({
    title: '创建任务',
    // @ts-expect-error
    content: h(TaskForm, {modelValue: task.value, 'onUpdate:modelValue': (val) => (task.value = val)}),
    async onOk() {
      const {data, error} = await useApi('/api/tasks/create').post(task).json();
      if (!error.value && data.value) {
        taskStore.addTask(data.value);
        message.success('任务创建成功');
      }
    }
  })
}


const editTask = (task: Task) => {
  const editedTask = ref<Task>({...task})

  Modal.confirm({
    title: '编辑任务',
    content: h(TaskForm, {modelValue: editedTask.value, 'onUpdate:modelValue': (val) => (editedTask.value = val)}),
    onOk() {
      updateTask(editedTask.value)
    }
  })
}

const deleteTask = (id: number) => {
  Modal.confirm({
    title: '确认删除任务？',
    async onOk() {
      const {error} = await useApi(`/api/tasks/delete/${id}`).delete();
      if (!error.value) {
        taskStore.removeTask(id);
        message.success('任务删除成功')
      }
    }
  })
}

const runTask = async (task: Task) => {
  const {error} = await useApi(`/api/tasks/run/${task.task_id}`).post();
  if (!error.value) {
    task.running = true;
    message.success(`任务 "${task.task_name}" 已触发运行`);
    heartbeat();
  }
}

const stopTask = async (task: Task) => {
  const {error} = await useApi(`/api/tasks/stop/${task.task_id}`);
  if (!error.value) {
    task.running = false;
    message.success(`任务 "${task.task_name}" 已停止运行`)
  }
}

onMounted(() => {
  fetchTasks().then(heartbeat)
});

onUnmounted(() => {
  window.clearTimeout(heartbeatTimer);
});

</script>

<template>
  <div class="p-4 bg-white h-full">
    <h2 class="text-lg font-bold mb-4">任务管理</h2>
    <a-button class='mb-4 ml-auto block w-fit' type="primary" @click="createTask">新建任务</a-button>
    <a-table size="small" :data-source="taskStore.tasks" :loading="loading" row-key="task_id" :pagination="false">
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
            @change="e => togglePersonalOnly(record, e.target.checked)"
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
      <a-table-column title="操作" key="action" align="center">
        <template #default="{ record }">
          <a-button type="link" @click="() => editTask(record)">编辑</a-button>
          <a-button type="link" danger @click="() => deleteTask(record.task_id)">删除</a-button>
          <a-button v-if="record.running"
                    type="link"
                    @click="() => stopTask(record)">
            停止
          </a-button>
          <a-button v-else
                    type="link"
                    @click="() => runTask(record)">
            运行
          </a-button>
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>
