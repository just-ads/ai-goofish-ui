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
const drawerOpen = ref(false)
const selectedKey = ref('/tasks')

const normalizeMenuKey = (path: string) => {
  if (path.startsWith('/logs')) {
    return '/logs'
  }

  if (['/tasks', '/result', '/system'].includes(path)) {
    return path
  }

  return '/tasks'
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

watch(() => route.path, (newPath) => {
  selectedKey.value = normalizeMenuKey(newPath)
}, {immediate: true})

const openDrawer = () => {
  drawerOpen.value = true
}

const closeDrawer = () => {
  drawerOpen.value = false
}

const handleMenuClick = (e: any) => {
  router.push(e.key)
  closeDrawer()
}
</script>

<template>
  <div class="flex-col h-full overflow-hidden bg-transparent">
    <Header class="z-20 shadow-md" :show-menu-trigger="true" @menu-trigger="openDrawer" />
    <div class="flex flex-1 h-0 overflow-hidden relative">
      <!-- 左侧菜单 -->
      <div
        class="hidden sm:flex flex-col h-full transition-all duration-300 ease-out border-r border-white/5 bg-black/20 backdrop-blur-md z-10"
        :class="collapsed ? 'w-20' : 'w-64'"
      >
        <div class="flex-1 overflow-y-auto overflow-x-hidden py-2">
          <a-menu
            class="!bg-transparent !border-r-0"
            mode="inline"
            theme="dark"
            :inline-collapsed="collapsed"
            :selected-keys="[selectedKey]"
            @click="handleMenuClick"
          >
            <a-menu-item key="/tasks" :icon="() => h(CalendarOutlined)">
              <span>任务管理</span>
            </a-menu-item>
            <a-menu-item key="/result" :icon="() => h(CarryOutOutlined)">
              <span>结果查看</span>
            </a-menu-item>
            <a-menu-item key="/logs" :icon="() => h(FieldTimeOutlined)">
              <span>任务日志</span>
            </a-menu-item>
            <a-menu-item key="/system" :icon="() => h(SettingOutlined)">
              <span>系统设置</span>
            </a-menu-item>
          </a-menu>
        </div>

        <!-- Collapse Trigger -->
        <div
          class="h-12 flex-center cursor-pointer hover:bg-white/5 border-t border-white/5 text-gray-400 hover:text-white transition-colors"
          @click="toggleCollapse"
        >
          <MenuUnfoldOutlined v-if="collapsed" class="text-lg" />
          <MenuFoldOutlined v-else class="text-lg" />
        </div>
      </div>

      <a-drawer
        class="sm:hidden"
        :open="drawerOpen"
        placement="left"
        width="260"
        :closable="false"
        :mask-closable="true"
        :body-style="{ padding: '8px 0', background: 'rgba(7, 10, 24, 0.98)' }"
        @close="closeDrawer"
      >
        <a-menu
          class="!bg-transparent !border-r-0"
          mode="inline"
          theme="dark"
          :selected-keys="[selectedKey]"
          @click="handleMenuClick"
        >
          <a-menu-item key="/tasks" :icon="() => h(CalendarOutlined)">
            <span>任务管理</span>
          </a-menu-item>
          <a-menu-item key="/result" :icon="() => h(CarryOutOutlined)">
            <span>结果查看</span>
          </a-menu-item>
          <a-menu-item key="/logs" :icon="() => h(FieldTimeOutlined)">
            <span>任务日志</span>
          </a-menu-item>
          <a-menu-item key="/system" :icon="() => h(SettingOutlined)">
            <span>系统设置</span>
          </a-menu-item>
        </a-menu>
      </a-drawer>

      <!-- 主体内容 -->
      <main class="flex-1 relative overflow-hidden bg-transparent">
        <!-- Decorative background elements -->
        <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[120px]" />
          <div class="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary-500/10 blur-[100px]" />
        </div>

        <!-- Scrollable Content -->
        <div class="relative z-10 h-full overflow-auto p-3 sm:p-4">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>
