<template>
  <div class="p-0 h-full flex-col">
    <div class="glass-card flex-1 flex-col p-6 animate-fade-in-up animate-duration-400">
      <div class="mb-6 flex gap-3 flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-xl font-bold m-0 text-gray-100">
          任务管理
        </h2>
        <a-button
          type="primary"
          class="w-full sm:w-auto !bg-primary-600 hover:!bg-primary-500 border-none shadow-md shadow-primary-500/20"
          @click="createTask"
        >
          <template #icon>
            <PlusOutlined/>
          </template>
          新建任务
        </a-button>
      </div>

      <div class="flex-1 overflow-hidden rounded-lg border border-gray-100/10">
        <a-spin :spinning="loading" class="block h-full">
          <div class="h-full overflow-y-auto space-y-3 block sm:hidden">
            <div
              v-for="record in taskStore.tasks"
              :key="record.task_id"
              class="rounded-xl border-solid border border-gray-100/10 bg-gray-900/50 p-4 shadow-lg shadow-black/15"
            >
              <div class="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div class="text-base font-semibold text-gray-100">
                    {{ record.task_name }}
                  </div>
                  <div class="mt-1 text-xs text-gray-400">
                    关键词
                    <a-tag color="blue" class="ml-1 !bg-blue-500/10 !border-blue-500/20 !text-blue-300">
                      {{ record.keyword }}
                    </a-tag>
                  </div>
                </div>
                <a-switch :checked="record.enabled" size="small" @change="() => toggleTaskEnabled(record)"/>
              </div>

              <div class="mb-3 space-y-1 text-xs text-gray-400">
                <div v-if="record.max_pages" class="flex-y-center gap-1">
                  <FileTextOutlined/>
                  <span>{{ record.max_pages }} 页</span>
                </div>
                <div v-if="record.min_price || record.max_price" class="flex-y-center gap-1">
                  <PayCircleOutlined/>
                  <span>{{ record.min_price || 0 }} - {{ record.max_price || '∞' }}</span>
                </div>
                <div class="flex-y-center gap-2">
                  <a-tooltip v-if="record.personal_only" title="仅个人闲置">
                    <UserOutlined class="text-green-400"/>
                  </a-tooltip>
                  <a-tooltip v-if="record.cron" :title="`下次运行时间: ${record.next_run_time}`">
                    <ClockCircleOutlined class="text-purple-400"/>
                  </a-tooltip>
                  <div v-if="record.running" class="flex-y-center gap-1 text-success animate-pulse">
                    <div class="h-1.5 w-1.5 rounded-full bg-success"/>
                    运行中
                  </div>
                  <div v-else class="text-gray-500">
                    已停止
                  </div>
                </div>
              </div>

              <div class="mb-3 flex flex-wrap gap-1">
                <a-tag class="m-0 border-none px-1.5">
                  运行 {{ record.run_record?.normal_count || 0 }}
                </a-tag>
                <a-tag :color="((record.run_record?.abnormal_count ?? 0) > 0) ? 'error' : 'default'" class="m-0 border-none px-1.5">
                  <template v-if="(record.run_record?.abnormal_count ?? 0) > 0" #icon>
                    <CloseCircleOutlined/>
                  </template>
                  异常 {{ record.run_record?.abnormal_count || 0 }}
                </a-tag>
                <a-tag :color="((record.run_record?.risk_count ?? 0) > 0) ? 'warning' : 'default'" class="m-0 border-none px-1.5">
                  <template v-if="(record.run_record?.risk_count ?? 0) > 0" #icon>
                    <WarningOutlined/>
                  </template>
                  风控 {{ record.run_record?.risk_count || 0 }}
                </a-tag>
              </div>

              <div class="flex-y-center justify-end gap-2">
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
            </div>

            <a-empty v-if="!taskStore.tasks.length" description="暂无任务"/>
          </div>

          <div class="hidden sm:block h-full">
            <a-table
              size="middle"
              :data-source="taskStore.tasks"
              :loading="loading"
              row-key="task_id"
              :pagination="false"
              :scroll="{ y: 'calc(100vh - 250px)' }"
              class="ant-table-glass"
            >
              <a-table-column key="enabled" title="启用" :width="50" align="center">
                <template #default="{ record }">
                  <a-switch
                    :checked="record.enabled"
                    size="small"
                    @change="() => toggleTaskEnabled(record)"
                  />
                </template>
              </a-table-column>

              <a-table-column key="task_name" title="任务名称" data-index="task_name" align="center" :width="100">
                <template #default="{ text }">
                  <span class="font-medium text-gray-100">{{ text }}</span>
                </template>
              </a-table-column>

              <a-table-column key="keyword" title="关键词" data-index="keyword" align="center" :width="100">
                <template #default="{ text }">
                  <a-tag color="blue" class="!bg-blue-500/10 !border-blue-500/20 !text-blue-300">
                    {{ text }}
                  </a-tag>
                </template>
              </a-table-column>

              <a-table-column key="config" title="配置" align="center" :width="80">
                <template #default="{ record }">
                  <div class="flex-col text-xs space-y-1 text-gray-400">
                    <div v-if="record.max_pages" class="flex-center gap-1">
                      <FileTextOutlined/>
                      <span>{{ record.max_pages }} 页</span>
                    </div>
                    <div v-if="record.min_price || record.max_price" class="flex-center gap-1">
                      <PayCircleOutlined/>
                      <span>{{ record.min_price || 0 }} - {{ record.max_price || '∞' }}</span>
                    </div>
                  </div>
                </template>
              </a-table-column>

              <a-table-column key="options" title="选项" align="center" :width="80">
                <template #default="{ record }">
                  <div class="flex-center gap-2">
                    <a-tooltip v-if="record.personal_only" title="仅个人闲置">
                      <UserOutlined class="text-green-400"/>
                    </a-tooltip>
                    <a-tooltip v-if="record.cron" :title="`下次运行时间: ${record.next_run_time}`">
                      <ClockCircleOutlined class="text-purple-400"/>
                    </a-tooltip>
                  </div>
                </template>
              </a-table-column>

              <a-table-column key="run_record" title="运行记录" data-index="run_record" align="center" :width="150">
                <template #default="{ text }">
                  <div class="flex-x-center gap-1">
                    <a-tag class="m-0 border-none px-1.5">
                      运行 {{ text?.normal_count || 0 }}
                    </a-tag>
                    <a-tag :color="(text?.abnormal_count > 0) ? 'error' : 'default'" class="m-0 border-none px-1.5">
                      <template v-if="text?.abnormal_count > 0" #icon>
                        <CloseCircleOutlined/>
                      </template>
                      异常 {{ text?.abnormal_count || 0 }}
                    </a-tag>

                    <a-tag :color="(text?.risk_count > 0) ? 'warning' : 'default'" class="m-0 border-none px-1.5">
                      <template v-if="text?.risk_count > 0" #icon>
                        <WarningOutlined/>
                      </template>
                      风控 {{ text?.risk_count || 0 }}
                    </a-tag>
                  </div>
                </template>
              </a-table-column>

              <a-table-column key="status" title="状态" :width="80" align="center">
                <template #default="{ record }">
                  <div v-if="record.running" class="flex-center gap-1 text-success text-xs animate-pulse">
                    <div class="w-1.5 h-1.5 rounded-full bg-success"/>
                    运行中
                  </div>
                  <div v-else class="text-gray-500 text-xs">
                    已停止
                  </div>
                </template>
              </a-table-column>

              <a-table-column key="action" title="操作" align="center" :width="200">
                <template #default="{ record }">
                  <div class="flex-x-center gap-2">
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
        </a-spin>
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
  ClockCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined
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
        'onUpdate:modelValue': (val) => {
          task.value = val
        },
      }
    ),
    async onOk() {
      const {data, error} = await useApi('/api/tasks').post(task.value).json();
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
    content: h(TaskForm, {
      modelValue: editedTask.value,
      'onUpdate:modelValue': (val) => {
        editedTask.value = val
      },
    }),
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
  taskStore.onReady().then(heartbeat)
});

onUnmounted(() => {
  window.clearTimeout(heartbeatTimer);
});
</script>
