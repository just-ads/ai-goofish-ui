<script setup lang="ts">
import Header from '@/components/header.vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';
import {h} from "vue";

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const selectedKey = ref(route.path || 'tasks')

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

// 路由变化时更新选中
watch(() => route.path, (newPath) => {
  selectedKey.value = newPath
})

// 菜单点击跳转
const handleMenuClick = (e: { key: string }) => {
  router.push(e.key)
}

</script>

<template>
  <div class="flex-col h-full">
    <Header/>
    <div class="flex flex-1">
      <!-- 左侧菜单 -->
      <div class="flex-col text-white">
        <a-button type="default" class="rounded-none border-y-none border-l-none border-r border-r-[rgba(5,5,5,0.06)]" @click="toggleCollapse">
          <MenuUnfoldOutlined v-if="collapsed"/>
          <MenuFoldOutlined v-else/>
        </a-button>
        <a-menu
          class="flex-1"
          mode="inline"
          :inline-collapsed="collapsed"
          :selected-keys="[selectedKey]"
          @click="handleMenuClick"
        >
          <a-menu-item key="tasks" :icon="() => h(CalendarOutlined)">任务管理</a-menu-item>
          <a-menu-item key="result" :icon="() => h(CarryOutOutlined)">结果查看</a-menu-item>
          <a-menu-item key="system" :icon="() => h(SettingOutlined)">系统设置</a-menu-item>
        </a-menu>
      </div>
      <!-- 主体内容 -->
      <main class="flex-1 bg-[#f0f2f5]">
        <router-view/>
      </main>
    </div>
  </div>
</template>

<style scoped>

</style>
