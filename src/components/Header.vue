<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message} from "ant-design-vue";
import {
  UserOutlined,
  CloudSyncOutlined,
  DeleteOutlined,
  RobotOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  BgColorsOutlined,
  CheckOutlined,
  BulbOutlined,
} from '@ant-design/icons-vue';
import {useUiThemeStore} from '@/store';

withDefaults(defineProps<{
  showMenuTrigger?: boolean
}>(), {
  showMenuTrigger: false
})

const emit = defineEmits<{
  (e: 'menu-trigger'): void
}>()

const uiTheme = useUiThemeStore()

const open = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const {data: isLogin} = useApi<boolean>('/api/goofish/status').json();
const jsonInput = ref<string>('');

const showModal = () => {
  open.value = true;
};

const closeModal = () => {
  open.value = false
  jsonInput.value = ''
}

const handleOk = async () => {
  const {error} = await useApi('/api/goofish/state/save').post({content: jsonInput.value});
  if (!error.value) {
    isLogin.value = true;
    message.success('状态保存成功');
    closeModal();
  }
}

const update = () => {
  showModal();
}

const remove = async () => {
  const {error} = await useApi('/api/goofish/state/delete').delete();
  if (!error.value) {
    isLogin.value = false;
    message.success('删除成功');
  }
}
</script>

<template>
  <header class="flex-y-center justify-between h-[64px] px-6 border-b border-gray-100/10 bg-gray-950/40 backdrop-blur-md">
    <div class="flex-y-center gap-3">
      <button
        v-if="showMenuTrigger"
        class="sm:hidden flex-center w-9 h-9 rounded-lg border bg-primary-500 border-white/15 text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
        type="button"
        aria-label="打开导航菜单"
        @click="emit('menu-trigger')"
      >
        <MenuOutlined class="text-lg"/>
      </button>
      <div class="hidden sm:flex flex-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
        <RobotOutlined class="text-xl text-white"/>
      </div>
      <h2 class="hidden sm:block text-xl font-bold m-0 tracking-wide text-primary-400">
        闲鱼监控机器人
      </h2>
    </div>

    <div class="flex-y-center gap-3">
      <button
        class="flex-center w-9 h-9 rounded-lg border border-gray-100/15 bg-gray-950/30 text-gray-400 hover:text-gray-100 hover:bg-gray-100/5 transition-colors"
        type="button"
        aria-label="切换浅色/深色"
        @click="uiTheme.toggleMode"
      >
        <BulbOutlined class="text-lg" :class="uiTheme.theme.mode === 'light' ? 'text-warning' : ''" />
      </button>

      <a-dropdown placement="bottomRight" trigger="click">
        <button
          class="flex-center w-9 h-9 rounded-lg border border-gray-100/15 bg-gray-950/30 text-gray-400 hover:text-gray-100 hover:bg-gray-100/5 transition-colors"
          type="button"
          aria-label="切换主题强调色"
        >
          <BgColorsOutlined class="text-lg" />
        </button>
        <template #overlay>
          <a-menu class="!bg-gray-800 !border !border-gray-700 !shadow-xl !rounded-lg overflow-hidden">
            <a-menu-item class="!text-gray-200 hover:!bg-gray-700" @click="uiTheme.setAccent('blue')">
              <template #icon>
                <CheckOutlined v-if="uiTheme.theme.accent === 'blue'" />
              </template>
              科技蓝
            </a-menu-item>
            <a-menu-item class="!text-gray-200 hover:!bg-gray-700" @click="uiTheme.setAccent('teal')">
              <template #icon>
                <CheckOutlined v-if="uiTheme.theme.accent === 'teal'" />
              </template>
              青绿色
            </a-menu-item>
            <a-menu-item class="!text-gray-200 hover:!bg-gray-700" @click="uiTheme.setAccent('indigo')">
              <template #icon>
                <CheckOutlined v-if="uiTheme.theme.accent === 'indigo'" />
              </template>
              靛蓝色
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <a-dropdown v-if="isLogin">
        <div
          class="flex-y-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 cursor-pointer hover:bg-success/20 transition-colors group"
        >
          <div class="w-2 h-2 rounded-full bg-success animate-pulse"/>
          <span class="text-success font-medium text-sm group-hover:text-success/90">咸鱼已登录</span>
          <UserOutlined class="text-success ml-1"/>
        </div>
        <template #overlay>
          <a-menu class="!bg-gray-800 !border !border-gray-700 !shadow-xl !rounded-lg overflow-hidden">
            <a-menu-item class="!text-gray-200 hover:!bg-gray-700" @click="update">
              <template #icon>
                <CloudSyncOutlined/>
              </template>
              更新 Cookie
            </a-menu-item>
            <a-menu-item class="!text-red-400 hover:!bg-red-900/20" @click="remove">
              <template #icon>
                <DeleteOutlined/>
              </template>
              删除 Cookie
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <div
        v-else class="flex-y-center gap-2 px-3 py-1.5 rounded-full bg-error/10 border border-error/20 cursor-pointer hover:bg-error/20 transition-colors group"
        @click="showModal"
      >
        <div class="w-2 h-2 rounded-full bg-error"/>
        <span class="text-error font-medium text-sm group-hover:text-error/90">未登录 (点击设置)</span>
        <ExclamationCircleOutlined class="text-error ml-1"/>
      </div>
    </div>

    <a-modal
      v-model:open="open"
      title="更新 Cookie"
      :confirm-loading="confirmLoading"
      :mask-style="{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.6)' }"
      wrap-class-name="dark-modal"
      @ok="handleOk"
    >
      <div class="py-4">
        <div class="mb-2 text-gray-400 text-sm">
          请粘贴最新的 JSON 格式 Cookie 数据：
        </div>
        <a-textarea
          v-model:value="jsonInput"
          :rows="8"
          placeholder="{&quot;cookie&quot;: &quot;...&quot;}"
          class="!bg-black/30 !border-gray-700 !text-gray-200 focus:!border-primary-500 !rounded-lg font-mono text-xs"
        />
      </div>
    </a-modal>
  </header>
</template>
