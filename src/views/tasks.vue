<template>
  <div class="p-0 h-full flex-col">
    <div class="glass-card flex-1 flex-col p-6 animate-fade-in-up">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold m-0 text-gray">任务管理</h2>
        <a-button type="primary" @click="createTask" class="!bg-primary-600 hover:!bg-primary-500 border-none shadow-md shadow-primary-500/20">
          <template #icon>
            <PlusOutlined/>
          </template>
          新建任务
        </a-button>
      </div>

      <div class="flex-1 overflow-hidden rounded-lg border border-white/5">
        <a-table
          size="middle"
          :data-source="taskStore.tasks"
          :loading="loading"
          row-key="task_id"
          :pagination="false"
          :scroll="{ y: 'calc(100vh - 250px)' }"
          class="ant-table-glass"
        >
          <a-table-column title="启用" key="enabled" width="80px" align="center">
            <template #default="{ record }">
              <a-switch
                :checked="record.enabled"
                @change="() => toggleTaskEnabled(record)"
                size="small"
              />
            </template>
          </a-table-column>

          <a-table-column title="任务名称" dataIndex="task_name" key="task_name">
            <template #default="{ text }">
              <span class="font-medium text-white">{{ text }}</span>
            </template>
          </a-table-column>

          <a-table-column title="关键词" dataIndex="keyword" key="keyword">
            <template #default="{ text }">
              <a-tag color="blue" class="!bg-blue-500/10 !border-blue-500/20 !text-blue-300">{{ text }}</a-tag>
            </template>
          </a-table-column>

          <a-table-column title="配置" key="config">
            <template #default="{ record }">
              <div class="flex-col text-xs space-y-1 text-gray-400">
                <div class="flex items-center gap-1" v-if="record.max_pages">
                  <FileTextOutlined/>
                  <span>{{ record.max_pages }} 页</span>
                </div>
                <div class="flex items-center gap-1" v-if="record.min_price || record.max_price">
                  <PayCircleOutlined/>
                  <span>{{ record.min_price || 0 }} - {{ record.max_price || '∞' }}</span>
                </div>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="选项" key="options">
            <template #default="{ record }">
              <div class="flex items-center gap-2">
                <a-tooltip title="仅个人闲置">
                  <UserOutlined :class="record.personal_only ? 'text-green-400' : 'text-gray-600'"/>
                </a-tooltip>
                <a-tooltip :title="`下次运行时间: ${record.next_run_time}`" v-if="record.cron">
                  <ClockCircleOutlined class="text-purple-400"/>
                </a-tooltip>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="描述" dataIndex="description" key="description">
            <template #default="{ text }">
              <a-tooltip :title="text" v-if="text">
                <span class="block w-32 truncate text-gray-500">{{ text }}</span>
              </a-tooltip>
              <span v-else class="text-gray-700">-</span>
            </template>
          </a-table-column>

          <a-table-column title="状态" key="status" width="100px" align="center">
            <template #default="{ record }">
              <div v-if="record.running" class="flex items-center justify-center gap-1 text-success text-xs animate-pulse">
                <div class="w-1.5 h-1.5 rounded-full bg-success"></div>
                运行中
              </div>
              <div v-else class="text-gray-500 text-xs">已停止</div>
            </template>
          </a-table-column>

          <a-table-column title="操作" key="action" align="center" width="200px">
            <template #default="{ record }">
              <div class="flex justify-center gap-2">
                <a-button type="text" size="small" class="!text-blue-400 hover:!text-blue-300" @click="() => editTask(record)">
                  <template #icon>
                    <EditOutlined/>
                  </template>
                </a-button>

                <a-button
                  v-if="record.running"
                  type="text"
                  size="small"
                  class="!text-orange-400 hover:!text-orange-300"
                  @click="() => stopTask(record)"
                >
                  <template #icon>
                    <PauseCircleOutlined/>
                  </template>
                </a-button>
                <a-button
                  v-else
                  type="text"
                  size="small"
                  class="!text-green-400 hover:!text-green-300"
                  @click="() => runTask(record)"
                >
                  <template #icon>
                    <PlayCircleOutlined/>
                  </template>
                </a-button>

                <a-button type="text" size="small" class="!text-red-400 hover:!text-red-300" @click="() => deleteTask(record.task_id)">
                  <template #icon>
                    <DeleteOutlined/>
                  </template>
                </a-button>
              </div>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useApi} from "@/api/fetch";
import TaskForm from "@/components/TaskForm.vue";
import {useTaskStore} from "@/store";
import {message, Modal} from 'ant-design-vue'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FileTextOutlined,
  PayCircleOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

import type {Task, UpdateTask} from "@/types/task";

const taskStore = useTaskStore();
const loading = ref(false);
let heartbeatTimer: number

const updateTask = async (task: UpdateTask) => {
  const {data, error} = await useApi(`/api/tasks/update`).post(task).json<Task>();
  if (data.value && !error.value) {
    taskStore.updateTask(data.value);
    message.success('任务状态已更新')
  } else {
    return Promise.reject();
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

const createTask = () => {
  const task = ref<Task>({
    task_id: 0,
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
    content: h(
      TaskForm,
      {
        modelValue: task.value,
        'onUpdate:modelValue': (val) => (task.value = val),
      }
    ),
    async onOk() {
      const {data, error} = await useApi('/api/tasks/create').post(task.value).json();
      if (!error.value && data.value) {
        taskStore.addTask(data.value);
        message.success('任务创建成功');
      } else {
        return Promise.reject();
      }
    }
  })
}


const editTask = (task: Task) => {
  const editedTask = ref<Task>({...task})

  Modal.confirm({
    title: '编辑任务',
    content: h(TaskForm, {modelValue: editedTask.value, 'onUpdate:modelValue': (val) => (editedTask.value = val)}),
    async onOk() {
      await updateTask(editedTask.value)
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
  const {error} = await useApi(`/api/tasks/stop/${task.task_id}`).post();
  if (!error.value) {
    task.running = false;
    message.success(`任务 "${task.task_name}" 已停止运行`)
  }
}

onMounted(() => {
  taskStore.onReady.then(heartbeat)
});

onUnmounted(() => {
  window.clearTimeout(heartbeatTimer);
});
</script>
