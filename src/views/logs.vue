<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {SyncOutlined} from '@ant-design/icons-vue';
// @ts-expect-error
import {DynamicScroller, DynamicScrollerItem} from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import {TaskLogEntry, TaskLogResponse, TaskLogsRequest} from "@/types/task";

const selectedTaskId = ref<number>();
const logs = ref<TaskLogEntry[]>([]);
const logsLoading = ref(false);
const scrollerRef = ref<any>(null);


const autoRefresh = ref(false);
const isLockedAtBottom = ref(true);
let refreshTimer: number | null = null;
const MAX_LOGS = 1000;
const requestOptions = reactive<TaskLogsRequest>({
  limit: 200,
});

const fetchLogs = async (id: number | undefined = selectedTaskId.value, request: TaskLogsRequest = requestOptions) => {
  if (logsLoading.value) return
  if (id === undefined) return
  try {
    logsLoading.value = true;
    const url = `/api/logs/${id}`;
    const {data, error} = await useApi(url).post(request).json<TaskLogResponse>();

    if (!error.value && data.value?.length) {
      const newItem = data.value
      const combined = [...logs.value, ...newItem];
      logs.value = combined.slice(-MAX_LOGS);

      requestOptions.from_time = newItem[newItem.length - 1].timestamp;
      if (isLockedAtBottom.value) {
        scrollToBottom();
      }
    }
  } catch (err) {
    console.error('Fetch logs failed', err);
  } finally {
    logsLoading.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollerRef.value) {
      scrollerRef.value.scrollToBottom();
    }
  });
};

const onScrollEnd = () => {
  if (!scrollerRef.value) return;
  const el = scrollerRef.value.$el;
  isLockedAtBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
};

const autoRefreshLogs = async () => {
  await fetchLogs();
  refreshTimer = window.setTimeout(() => {
    autoRefreshLogs()
  }, 2000)
}

const toggleAutoRefresh = (checked: any) => {
  if (checked) {
    if (isLockedAtBottom.value) scrollToBottom();
    autoRefreshLogs();
  } else {
    if (refreshTimer) clearTimeout(refreshTimer);
  }
}

const selectTask = (taskId: any) => {
  logs.value = [];
  fetchLogs(taskId, {});
}

const filterLogLevel = (filter: any) => {
  logs.value = [];
  fetchLogs(selectedTaskId.value, {
    levels: filter.length ? filter : undefined,
  });
}

onUnmounted(() => {
  if (refreshTimer) clearTimeout(refreshTimer);
});

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {'错误': '#f87171', '警告': '#fb923c', '提示': '#60a5fa', 'DEBUG': '#9ca3af'};
  return colors[level] || '#d9d9d9';
};
</script>

<template>
  <div class="flex-col p-4 bg-white h-full">
    <h2 class="text-lg font-bold mb-4">任务日志</h2>
    <div class="flex-1 h-0 flex-col bg-[#1a1a1a] text-gray-200 rounded-lg border border-gray-800 font-mono">
      <div class="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-800">
        <div class="flex items-center space-x-6">
          <div class='w-40'>
            <TaskSelect v-model:modelValue="selectedTaskId" @change="selectTask"/>
          </div>
          <div class='flex items-center gap-2.5'>
            <div>过滤</div>
            <a-select :value="requestOptions.levels" placeholder="无过滤" class="w-62" @change="filterLogLevel" mode="multiple">
              <a-select-option key="提示">提示</a-select-option>
              <a-select-option key="警告">警告</a-select-option>
              <a-select-option key="错误">错误</a-select-option>
              <a-select-option key="DEBUG">DEBUG</a-select-option>
            </a-select>
          </div>
          <a-button>
            <template #icon>
              <SyncOutlined :spin="logsLoading" @click="fetchLogs()"/>
            </template>
          </a-button>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-400">自动刷新</span>
            <a-switch v-model:checked="autoRefresh" @change="toggleAutoRefresh"/>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div v-if="!isLockedAtBottom && autoRefresh"
               @click="scrollToBottom"
               class="cursor-pointer text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 hover:bg-blue-600/40">
            发现新日志 ↓
          </div>
          <span class="text-[10px] text-gray-500">Buffer: {{ logs.length }}/{{ MAX_LOGS }}</span>
        </div>
      </div>

      <div class="flex-1 h-0 overflow-hidden relative">
        <DynamicScroller
          ref="scrollerRef"
          class="h-full px-2"
          :items="logs"
          :min-item-size="24"
          key-field="id"
          @scrollend="onScrollEnd"
        >
          <template #default="{ item, active, index }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[item.message]"
              :data-index="index"
            >
              <div class="border-b-[#ddd] flex items-baseline text-[12px]">
                <span class="text-gray-500 mr-4 whitespace-nowrap">{{ item.timestamp }}</span>
                <span :style="{ color: getLevelColor(item.level) }" class="w-14 flex-shrink-0 font-bold whitespace-nowrap">
                  [{{ item.level }}]
                </span>
                <span class="text-gray-300">{{ item.message }}</span>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>

        <div v-if="logsLoading" class="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <a-spin size="default" :delay="500"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #444;
}
</style>
