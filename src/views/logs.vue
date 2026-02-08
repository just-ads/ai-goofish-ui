<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {SyncOutlined} from '@ant-design/icons-vue';
// @ts-expect-error
import {DynamicScroller, DynamicScrollerItem} from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import {TaskLogEntry, TaskLogResponse, TaskLogsRequest} from "@/types/task";
import TaskSelect from "@/components/TaskSelect.vue";

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
  if (!autoRefresh.value) return;
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
  const colors: Record<string, string> = {
    '错误': '#ef4444',
    '警告': '#f97316',
    '提示': '#3b82f6',
    'DEBUG': '#6b7280'
  };
  return colors[level] || '#d1d5db';
};
</script>

<template>
  <div class="flex-col h-full gap-4">
    <div class="glass-card flex-1 h-full flex-col p-4 animate-fade-in-up animate-duration-400">
      <div class="flex-y-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray m-0">
          任务日志
        </h2>
      </div>

      <div class="flex-1 h-0 flex-col bg-black/40 rounded-lg border border-white/10 font-mono shadow-inner overflow-hidden">
        <!-- Toolbar -->
        <div class="flex gap-3 flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white/5 border-b border-white/5 backdrop-blur-sm">
          <div class="flex gap-3 flex-col sm:flex-row sm:items-center sm:gap-4 sm:flex-wrap">
            <div class="w-full sm:w-56">
              <TaskSelect v-model:model-value="selectedTaskId" size="small" @change="selectTask"/>
            </div>

            <div class="hidden sm:block h-4 w-px bg-white/10 mx-2"/>

            <div class="flex-y-center gap-2 text-sm text-gray-400 w-full sm:w-auto">
              <span class="text-xs shrink-0">级别:</span>
              <a-select
                :value="requestOptions.levels"
                placeholder="全部"
                class="w-full sm:min-w-[120px]"
                mode="multiple"
                size="small"
                :max-tag-count="1"
                @change="filterLogLevel"
              >
                <a-select-option key="提示">
                  提示
                </a-select-option>
                <a-select-option key="警告">
                  警告
                </a-select-option>
                <a-select-option key="错误">
                  错误
                </a-select-option>
                <a-select-option key="DEBUG">
                  DEBUG
                </a-select-option>
              </a-select>
            </div>

            <div class="hidden sm:block h-4 w-px bg-white/10 mx-2"/>

            <div class="flex-y-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <a-button type="text" size="small" class="!text-gray-400 hover:!text-white" @click="fetchLogs()">
                <template #icon>
                  <SyncOutlined :spin="logsLoading"/>
                </template>
              </a-button>

              <div class="flex-y-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/5">
                <span class="text-xs text-gray-400">自动刷新</span>
                <a-switch v-model:checked="autoRefresh" size="small" @change="toggleAutoRefresh"/>
              </div>
            </div>
          </div>

          <div class="flex-y-center justify-between gap-3 w-full sm:w-auto">
            <transition name="fade">
              <div
                v-if="!isLockedAtBottom && autoRefresh"
                class="flex-y-center cursor-pointer text-[10px] bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full border border-primary-500/30 hover:bg-primary-500/30 gap-1 animate-pulse"
                @click="scrollToBottom"
              >
                <span>↓ 新日志</span>
              </div>
            </transition>
            <div class="text-[10px] text-gray-600 font-mono bg-black/30 px-2 py-1 rounded">
              BUFFER: {{ logs.length }}/{{ MAX_LOGS }}
            </div>
          </div>
        </div>

        <!-- Log Content -->
        <div class="flex-1 h-0 overflow-hidden relative bg-black/20">
          <DynamicScroller
            ref="scrollerRef"
            class="h-full px-4 py-2 custom-scrollbar"
            :items="logs"
            :min-item-size="28"
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
                <div class="sm:flex items-baseline py-1 hover:bg-white/5 px-2 rounded -mx-2 group">
                  <div class="flex">
                    <span class="text-gray-600 text-sm mr-3 font-mono shrink-0 select-none">{{ item.timestamp }}</span>
                    <span
                      :style="{ color: getLevelColor(item.level) }"
                      class="text-[11px] font-bold mr-3 w-10 shrink-0 uppercase tracking-wider select-none text-center bg-white/5 rounded px-1"
                    >
                      {{ item.level }}
                    </span>
                  </div>
                  <div class="flex-1 text-gray-300 text-xs font-mono break-all leading-relaxed group-hover:text-white">
                    {{ item.message }}
                  </div>
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>

          <transition name="fade">
            <div v-if="logsLoading && logs.length === 0" class="absolute inset-0 flex-col-center bg-black/40 backdrop-blur-sm z-10">
              <a-spin size="large"/>
              <div class="mt-4 text-gray-400 text-sm">
                正在加载日志...
              </div>
            </div>
          </transition>

          <div v-if="!logsLoading && logs.length === 0" class="absolute flex-center inset-0 text-gray-600">
            暂无日志数据
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
