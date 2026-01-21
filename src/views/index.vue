<script setup lang="ts">
import Header from '@/components/Header.vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  SettingOutlined,
  FieldTimeOutlined
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
const handleMenuClick = (e: any) => {
  router.push(e.key)
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden bg-transparent">
    <Header class="z-20 shadow-md"/>
    <div class="flex flex-1 h-0 overflow-hidden relative">
      <!-- 左侧菜单 -->
      <div
        class="flex flex-col h-full transition-all duration-300 ease-out border-r border-white/5 bg-black/20 backdrop-blur-md z-10"
        :class="collapsed ? 'w-20' : 'w-64'"
      >
        <div class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-2">
          <a-menu
            class="!bg-transparent !border-r-0"
            mode="inline"
            theme="dark"
            :inline-collapsed="collapsed"
            :selected-keys="[selectedKey]"
            @click="handleMenuClick"
          >
            <a-menu-item key="tasks" :icon="() => h(CalendarOutlined)">
              <span>任务管理</span>
            </a-menu-item>
            <a-menu-item key="result" :icon="() => h(CarryOutOutlined)">
              <span>结果查看</span>
            </a-menu-item>
            <a-menu-item key="logs" :icon="() => h(FieldTimeOutlined)">
              <span>任务日志</span>
            </a-menu-item>
            <a-menu-item key="system" :icon="() => h(SettingOutlined)">
              <span>系统设置</span>
            </a-menu-item>
          </a-menu>
        </div>

        <!-- Collapse Trigger -->
        <div
          class="h-12 flex items-center justify-center cursor-pointer hover:bg-white/5 border-t border-white/5 text-gray-400 hover:text-white transition-colors"
          @click="toggleCollapse"
        >
          <MenuUnfoldOutlined v-if="collapsed" class="text-lg"/>
          <MenuFoldOutlined v-else class="text-lg"/>
        </div>
      </div>

      <!-- 主体内容 -->
      <main class="flex-1 relative overflow-hidden bg-transparent">
        <!-- Decorative background elements -->
        <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[120px]"></div>
          <div class="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary-500/10 blur-[100px]"></div>
        </div>

        <!-- Scrollable Content -->
        <div class="relative z-10 h-full overflow-auto custom-scrollbar p-4">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component"/>
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>
