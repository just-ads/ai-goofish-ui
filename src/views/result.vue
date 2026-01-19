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

    <div class="flex py-2.5">
      <div>
        <span>排序: </span>
        <a-select v-model:value="taskResultRequest.sort_by" @select="onSortChange" class="w-30">
          <a-select-option value="price">价格</a-select-option>
          <a-select-option value="publish_time">发布时间</a-select-option>
          <a-select-option value="crawl_time">抓取时间</a-select-option>
        </a-select>
      </div>
      <div class="flex ml-1">
        <a-button type="text" class="p-0" @click="onToggleOrder">
          <component :is="taskResultRequest.order === 'asce' ? ArrowUpOutlined : ArrowDownOutlined"/>
        </a-button>
      </div>
      <a-pagination
        v-if="taskResults"
        class="ml-auto"
        v-model:current="taskResultRequest.page"
        v-model:page-size="taskResultRequest.limit"
        :total="taskResults.total"
        @change="onPageChange"
      />
    </div>

    <a-spin :spinning="loading" wrapperClassName="flex-1 h-0 overflow-auto">
      <div v-if="taskResults?.items?.length" class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] mt-4 max-h-full">
        <div
          v-for="result in taskResults.items"
          :key="result['商品信息']['商品ID']"
          class="border border-gray-200 rounded-md p-2 bg-white relative"
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
          <div v-if="result['分析结果']">
            <a-tag :color="getColor(result['分析结果']['推荐度'])" class="absolute top-2 right-0 cursor-default">
              {{ result['分析结果']['建议'] }}
            </a-tag>
            <a-tooltip destroyTooltipOnHide trigger='click' class="max-h-[50px] overflow-auto">
              <template #title>
                {{ result['分析结果']['原因'] }}
              </template>
              <div class="text-blue ml-auto text-center cursor-pointer">查看ai分析详情</div>
            </a-tooltip>
          </div>
          <a-divider/>
          <div class="flex">
            <div>
              <div class="text-xs text-gray-500 mb-1">发布时间：{{ result['商品信息']['发布时间'] }}</div>
              <div class="text-xs text-gray-500">抓取时间：{{ result['爬取时间'] }}</div>
            </div>
            <div class="text-xs text-blue-500 w-fit ml-auto" title="商品链接">
              <a :href="result['商品信息']['商品链接']" target="_blank" class="block mb-1">查看</a>
              <div class="cursor-pointer" @click="copyUrl(result['商品信息']['商品ID'])">复制</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="mt-4 text-gray-400">暂无结果</div>
    </a-spin>

    <PriceLineChart :chartDataSource="pricesData" :loading="chartLoading"/>
  </div>
</template>

<script setup lang="ts">
import {useApi} from "@/api/fetch";
import PriceLineChart from "@/components/PriceLineChart.vue";
import {TaskResultResponse, TaskResultRequest} from "@/types/task";
import {copyToClipboard} from "@/utils/utils";
import {message, Modal} from "ant-design-vue";
import {h} from "vue";
import {ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined} from '@ant-design/icons-vue'
import {useTaskStore} from '@/store';

const taskStore = useTaskStore();

const selectedTaskId = ref<number>();
const taskResults = ref<TaskResultResponse | null>(null);
const loading = ref(false);
const chartLoading = ref(false);
const pricesData = ref<{ '时间': string, '价格': string }[]>([]);

const taskResultRequest = reactive<TaskResultRequest>({
  page: 1,
  limit: 30,
  sort_by: 'crawl_time',
  recommended_only: false,
  order: 'asce'
})

const getColor = (suggest: number) => {
  if (suggest >= 80) {
    return 'success'
  } else if (suggest >= 60) {
    return 'blue'
  } else if (suggest >= 30) {
    return 'warning'
  } else {
    return 'red'
  }
}


const fetchTaskResults = async (taskId: number, request: TaskResultRequest) => {
  if (taskId === undefined) return;
  loading.value = true;
  const {data, error} = await useApi(`/api/results/${taskId}`).post(request).json<TaskResultResponse>();
  loading.value = false;
  if (data.value && !error.value) {
    taskResults.value = data.value;
  }
}

const fetchPricesData = async (taskId: number) => {
  if (taskId === undefined) return;
  chartLoading.value = true;
  const {data, error} = await useApi(`/api/results/prices/${taskId}`).get().json<{ '时间': string, '价格': string }[]>();
  chartLoading.value = false;
  if (data.value && !error.value) {
    pricesData.value = data.value;
  }
}

const reload = () => {
  if (selectedTaskId.value !== undefined) {
    fetchTaskResults(selectedTaskId.value, taskResultRequest)
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
      const {error} = await useApi(`/api/results/${selectedTaskId.value!}`).delete();
      if (!error.value) {
        taskResults.value = null;
        taskResultRequest.page = 1;
        message.success('删除成功');
      }
    }
  })
}

const onPageChange = (page: number) => {
  if (selectedTaskId.value !== undefined) {
    fetchTaskResults(selectedTaskId.value, {
      ...taskResultRequest,
      page,
    });
  }
}

const onSortChange = (key: any) => {
  if (selectedTaskId.value !== undefined) {
    fetchTaskResults(selectedTaskId.value, {
      ...taskResultRequest,
      sort_by: key
    })
  }
}

const onToggleOrder = () => {
  taskResultRequest.order = taskResultRequest.order === 'asce' ? 'desc' : 'asce';
  if (selectedTaskId.value !== undefined) {
    fetchTaskResults(selectedTaskId.value, taskResultRequest)
  }
}

watch(selectedTaskId, (id) => {
  taskResultRequest.page = 1;
  if (id !== undefined) {
    fetchTaskResults(id, taskResultRequest);
    fetchPricesData(id);
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
    fetchTaskResults(selectedTaskId.value, taskResultRequest);
    fetchPricesData(selectedTaskId.value);
  }
});
</script>
