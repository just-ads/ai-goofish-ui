<script setup lang="ts">
import {useApi} from "@/api/fetch";
import PriceLineChart from "@/components/PriceLineChart.vue";
import TaskSelect from "@/components/TaskSelect.vue";
import {TaskResultResponse, TaskResultRequest} from "@/types/task";
import {copyToClipboard} from "@/utils/utils";
import {message, Modal} from "ant-design-vue";
import {
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  CopyOutlined,
  LinkOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ClockCircleOutlined,
  LineChartOutlined
} from '@ant-design/icons-vue'

const selectedTaskId = ref<number>();
const taskResults = ref<TaskResultResponse | null>(null);
const loading = ref(false);
const chartVisibility = ref(false);
const chartLoading = ref(false);
const pricesData = ref<{ '时间': string, '价格': string }[]>([]);
const viewImagesTaskId = ref<string | null>(null);

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

const selectTask = (id?: number) => {
  taskResultRequest.page = 1;
  if (id !== undefined) {
    fetchTaskResults(id, taskResultRequest);
    fetchPricesData(id);
  }
}

</script>

<template>
  <div class="h-full flex-col gap-4">
    <!-- Top Control Panel -->
    <div class="glass-card p-4 animate-fade-in-down flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class='w-72'>
            <TaskSelect v-model:modelValue="selectedTaskId" @change="selectTask"/>
          </div>
          <a-button type="primary" :loading="loading" class="!rounded-md" @click="reload">
            <template #icon>
              <ReloadOutlined/>
            </template>
            刷新
          </a-button>
          <a-button danger type="primary" class="!rounded-md" @click="removeResult">
            <template #icon>
              <DeleteOutlined/>
            </template>
            删除结果
          </a-button>
          <a-button @click="chartVisibility = !chartVisibility">
            <template #icon>
              <LineChartOutlined/>
            </template>
            {{ chartVisibility ? '隐藏' : '显示' }}价格趋势
          </a-button>
        </div>

        <!-- Pagination -->
        <a-pagination
          v-if="taskResults"
          v-model:current="taskResultRequest.page"
          v-model:page-size="taskResultRequest.limit"
          :total="taskResults.total"
          @change="onPageChange"
          size="small"
          show-quick-jumper
        />
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-4 text-sm text-gray-400">
        <div class="flex items-center gap-2">
          <span>排序:</span>
          <a-select v-model:value="taskResultRequest.sort_by" @select="onSortChange" class="w-32" size="small">
            <a-select-option value="price">价格</a-select-option>
            <a-select-option value="publish_time">发布时间</a-select-option>
            <a-select-option value="crawl_time">抓取时间</a-select-option>
          </a-select>
        </div>

        <a-button type="text" size="small" @click="onToggleOrder" class="!text-gray-400 hover:!text-white">
          <template #icon>
            <component :is="taskResultRequest.order === 'asce' ? ArrowUpOutlined : ArrowDownOutlined"/>
          </template>
          {{ taskResultRequest.order === 'asce' ? '升序' : '降序' }}
        </a-button>
      </div>
    </div>

    <!-- Results Grid -->
    <div class="flex-1 min-h-0 relative overflow-y-auto">
      <a-spin :spinning="loading" wrapperClassName="h-full">
        <div v-if="taskResults?.items?.length" class="h-full custom-scrollbar pr-2">
          <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] pb-4">
            <div
              v-for="result in taskResults.items"
              :key="result['商品信息']['商品ID']"
              class="glass-card p-0 overflow-hidden group hover:translate-y-[-4px] transition-transform duration-300"
            >
              <!-- Image Container -->
              <div class="relative h-48 bg-black/40 overflow-hidden">
                <div v-if="result['商品信息']['商品图片列表']?.length">
                  <a-image
                    :preview="{ visible: false }"
                    :src="result['商品信息']['商品图片列表'][0]"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    @click="viewImagesTaskId = result['商品信息']['商品ID']"
                  />
                  <div style="display: none" v-if="result['商品信息']['商品图片列表'].length > 1">
                    <a-image-preview-group
                      :preview="{visible: viewImagesTaskId === result['商品信息']['商品ID'], onVisibleChange: vis => (viewImagesTaskId = null)}"
                    >
                      <a-image v-for="it in result['商品信息']['商品图片列表']" :src="it"/>
                    </a-image-preview-group>
                  </div>
                </div>
                <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
                  无图片
                </div>

                <!-- Price Badge -->
                <div class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white font-bold flex items-baseline gap-1">
                  <span class="text-xs">¥</span>
                  <span class="text-lg text-red-400">{{ result['商品信息']['当前售价'] }}</span>
                </div>

                <!-- Original Price -->
                <div v-if="result['商品信息']['商品原价']"
                     class="absolute bottom-2 right-2 bg-black/40 px-1.5 py-0.5 rounded text-xs text-gray-400 line-through">
                  ¥{{ result['商品信息']['商品原价'] }}
                </div>
              </div>

              <!-- Content -->
              <div class="p-4">
                <div
                  class="text-sm font-medium mb-2 text-gray-200 line-clamp-2 h-10 group-hover:text-primary-400 transition-colors"
                  :title="result['商品信息']['商品标题']"
                >
                  {{ result['商品信息']['商品标题'] }}
                </div>

                <div class="flex-col gap-1 text-xs text-gray-500 mb-3">
                  <div class="flex items-center gap-1">
                    <EnvironmentOutlined class="text-gray-600"/>
                    {{ result['商品信息']['发货地区'] || '未知地区' }}
                  </div>
                  <div class="flex items-center gap-1">
                    <UserOutlined class="text-gray-600"/>
                    {{ result['卖家信息']['卖家昵称'] || '未知卖家' }}
                  </div>
                  <div class="flex items-center gap-1">
                    <ClockCircleOutlined class="text-gray-600"/>
                    {{ result['商品信息']['发布时间'] }}
                  </div>
                </div>

                <!-- AI Analysis -->
                <div v-if="result['分析结果']" class="bg-white/5 rounded p-2 mb-3 border border-white/5">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-gray-400">AI 推荐度</span>
                    <a-tag :color="getColor(result['分析结果']['推荐度'])" class="!m-0 text-xs">
                      {{ result['分析结果']['建议'] }}
                    </a-tag>
                  </div>
                  <div class="text-xs text-gray-400 line-clamp-2" :title="result['分析结果']['原因']">
                    {{ result['分析结果']['原因'] }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                  <div class="text-xs text-gray-600">
                    {{ result['爬取时间'] }} 抓取
                  </div>
                  <div class="flex gap-2">
                    <a-button type="text" size="small" class="!text-primary-400 hover:!text-primary-300" @click="copyUrl(result['商品信息']['商品ID'])">
                      <template #icon>
                        <CopyOutlined/>
                      </template>
                    </a-button>
                    <a
                      :href="result['商品信息']['商品链接']"
                      target="_blank"
                      class="ant-btn ant-btn-text ant-btn-sm !text-blue-400 hover:!text-blue-300 flex items-center justify-center"
                    >
                      <LinkOutlined/>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="h-full flex flex-col items-center justify-center text-gray-500">
          <div class="text-6xl mb-4 opacity-20">
            <EnvironmentOutlined/>
          </div>
          <div>暂无数据</div>
        </div>
      </a-spin>
    </div>

    <!-- Chart Section -->
    <div class="h-64 glass-card p-4 shrink-0" v-if="chartVisibility && selectedTaskId !== undefined">
      <PriceLineChart :chartDataSource="pricesData" :loading="chartLoading"/>
    </div>
  </div>
</template>
