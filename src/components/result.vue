<template>
  <div class="p-4 h-full flex-col">
    <div class="space-x-xl">
      <a-select
        v-model:value="selectedTaskId"
        placeholder="选择任务"
        class="w-72 mb-4"
      >
        <a-select-option
          v-for="task in taskStore.tasks"
          :key="task.task_id"
          :value="task.task_id"
        >
          {{ task.task_name }}
        </a-select-option>
      </a-select>
      <a-button type="primary" :loading="loading" :icon="h(ReloadOutlined)" @click="reload">刷新</a-button>
      <a-button danger type="primary" @click="() => removeResult()">删除结果</a-button>
    </div>

    <div>
      <span>排序: </span>
      <a-select v-model:value="sortKey" @select="onSortChange" class="w-30">
        <a-select-option value="price">价格</a-select-option>
        <a-select-option value="publish_time">发布时间</a-select-option>
        <a-select-option value="crawl_time">抓取时间</a-select-option>
      </a-select>
    </div>

    <a-spin :spinning="loading" wrapperClassName="flex-1 h-0 overflow-auto">
      <div v-if="taskResults?.items?.length" class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] mt-4 max-h-full">
        <div
          v-for="result in taskResults.items"
          :key="result['商品信息']['商品ID']"
          class="border border-gray-200 rounded-md p-2 bg-white"
        >
          <img
            v-if="result['商品信息']['商品图片列表']?.length"
            :src="result['商品信息']['商品图片列表'][0]"
            class="w-full h-32 object-contain mb-2"
          />
          <div
            class="font-medium mb-1 text-sm line-clamp-2"
            :title="result['商品信息']['商品标题']"
          >
            {{ result['商品信息']['商品标题'] }}
          </div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-red-500 font-bold">{{ result['商品信息']['当前售价'] }}</span>
            <span class="line-through text-gray-400">{{ result['商品信息']['商品原价'] }}</span>
          </div>
          <div class="text-xs text-gray-500 mb-1">发货地: {{ result['商品信息']['发货地区'] }}</div>
          <div class="text-xs text-gray-500 mb-1">卖家: {{ result['卖家信息']['卖家昵称'] }}</div>
          <a-divider/>
          <div class="flex">
            <div>
              <div class="text-xs text-gray-500 mb-1">发布时间：{{ result['商品信息']['发布时间'] }}</div>
              <div class="text-xs text-gray-500">抓取时间：{{ result['爬取时间'] }}</div>
            </div>
            <div class="text-xs text-blue-500 w-fit ml-auto" title="商品链接">
              <a :href="result['商品信息']['商品链接']" target="_blank" class="block mb-1">查看</a>
              <div class="cursor-pointer" @click="copyUrl(result['商品信息']['商品ID'])">复制链接</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="mt-4 text-gray-400">暂无结果</div>
    </a-spin>

    <a-pagination
      v-if="taskResults"
      class="mt-4"
      :current="currentPage"
      :page-size="pageSize"
      :total="taskResults.total"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import {TaskResultResponse, TaskResultRequest} from "@/types/task";
import {copyToClipboard} from "@/utils/utils";
import {message, Modal} from "ant-design-vue";
import {h} from "vue";
import {ReloadOutlined} from '@ant-design/icons-vue'
import {useTaskStore} from '@/store';
import {getTaskResult, removeTaskResult} from '@/api/task';

const taskStore = useTaskStore();

const selectedTaskId = ref<number>();
const taskResults = ref<TaskResultResponse | null>(null);
const loading = ref(false);

const sortKey = ref<TaskResultRequest['sort_by']>('crawl_time');
const currentPage = ref(1);
const pageSize = ref(20);


const fetchTaskResults = async (taskId: number, page = 1, sort: TaskResultRequest['sort_by']) => {
  if (taskId === undefined) return;
  loading.value = true;
  try {
    taskResults.value = await getTaskResult(Number(taskId), {page, limit: pageSize.value, sort_by: sort});
  } finally {
    loading.value = false;
  }
}

const onPageChange = (page: number) => {
  currentPage.value = page;
  if (selectedTaskId.value !== undefined) {
    fetchTaskResults(selectedTaskId.value, page, sortKey.value);
  }
}

const reload = () => {
  if (selectedTaskId.value !== undefined) {
    fetchTaskResults(selectedTaskId.value, currentPage.value, sortKey.value)
  }
}

const copyUrl = (id: string) => {
  const mobileUrl = `https://pages.goofish.com/sharexy?loadingVisible=false&bft=item&bfs=idlepc.item&spm=a21ybx.item.0.0&bfp=%7B%22id%22%3A${id}%7D`
  copyToClipboard(mobileUrl).then(() => {
    message.success('复制成功')
  }).catch(() => {
    message.success('复制失败: 无权限')
  });
}

const removeResult = () => {
  if (selectedTaskId.value === undefined) return;
  Modal.confirm({
    title: '删除结果',
    content: '删除后不可恢复，确定删除？',
    async onOk() {
      try {
        await removeTaskResult(selectedTaskId.value!);
        taskResults.value = null;
        currentPage.value = 1;
        message.success('删除成功');
      } catch (err) {
        message.error('删除失败');
      }
    }
  })
}

const onSortChange = (key: any) => {
  if (selectedTaskId.value !== undefined) {
    fetchTaskResults(selectedTaskId.value, currentPage.value, key)
  }
}

watch(selectedTaskId, (id) => {
  currentPage.value = 1;
  if (id !== undefined) {
    fetchTaskResults(id, 1, sortKey.value);
  }
});

watch(
  () => taskStore.tasks,
  (tasks) => {
    if (!selectedTaskId.value && tasks.length) {
      selectedTaskId.value = tasks[0].task_id;
    }
  },
  {immediate: true}
);

onMounted(() => {
  if (selectedTaskId.value !== undefined) {
    fetchTaskResults(selectedTaskId.value, currentPage.value, sortKey.value);
  }
});
</script>
