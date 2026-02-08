<template>
  <a-spin :spinning="loading" tip="加载中...">
    <div v-show="!loading" class="min-h-[200px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </a-spin>
</template>

<script setup>
import {Line} from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Title
} from 'chart.js'
import {Spin as ASpin} from 'ant-design-vue'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Title)

const props = defineProps({
  chartDataSource: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '价格趋势图'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartData = computed(() => {
  const labels = props.chartDataSource.map(item => item['时间'])
  const data = props.chartDataSource.map(item => parseFloat(item['价格'].replace('￥', '').trim()))
  return {
    labels,
    datasets: [
      {
        label: '价格 (元)',
        data,
        borderColor: '#409EFF',
        backgroundColor: 'rgba(64,158,255,0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: props.title,
      color: '#333',
      font: {size: 16, weight: 'bold'}
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: context => `￥${context.parsed.y}`
      }
    }
  },
  scales: {
    x: {
      ticks: {color: '#666'},
      title: {
        display: true,
        text: '时间',
        color: '#666'
      }
    },
    y: {
      ticks: {color: '#666'},
      title: {
        display: true,
        text: '价格 (元)',
        color: '#666'
      }
    }
  }
}))
</script>
