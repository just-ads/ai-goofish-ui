<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message} from "ant-design-vue";
import BrowserSettings from "@/components/BrowserSettings.vue";
import NotificationSettings from "@/components/NotificationSettings.vue";
import EvaluatorSettings from "@/components/EvaluatorSettings.vue";
import AISettings from "@/components/AISettings.vue";
import {WarningOutlined, SaveOutlined} from "@ant-design/icons-vue";

import type {SystemConfig} from "@/types/system";

const activeTab = ref('browser');
const configChanged = ref(false);
const saving = ref(false);

const {data: systemConfig, execute: refreshConfig} = useApi<SystemConfig>('api/system', {
  initialData: {
    browser: {
      headless: true,
      channel: 'chrome'
    },
    notifications: {
      enabled: false,
      providers: []
    },
    evaluator: {
      enabled: true,
      textAI: null,
      imageAI: null
    }
  }
}).json<SystemConfig>();


// 更新配置
const updateConfig = (newConfig: SystemConfig) => {
  configChanged.value = true;
  systemConfig.value = newConfig;
};

// 保存系统配置
const handleSave = async () => {
  saving.value = true;
  const {error} = await useApi('api/system').post(systemConfig.value).json();
  saving.value = false;

  if (!error.value) {
    message.success("保存成功");
    configChanged.value = false;
    await refreshConfig();
  } else {
    message.error("保存失败");
  }
};
</script>

<template>
  <div class="flex-col h-full gap-4">
    <div class="glass-card flex-1 flex-col p-6 animate-fade-in-up animate-duration-400 h-full">
      <!-- 页面标题 -->
      <div class="flex gap-3 flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-white/5 pb-4">
        <h2 class="text-xl font-bold text-gray-100 m-0">
          系统设置
        </h2>
        <div class="flex gap-2 w-full sm:w-auto flex-col sm:flex-row sm:items-center sm:gap-4">
          <transition name="fade">
            <div v-if="configChanged" class="flex-y-center gap-2 text-warning px-3 py-1 bg-warning/10 rounded-full border border-warning/20">
              <WarningOutlined class="animate-pulse" />
              <span class="text-sm font-medium">配置未保存</span>
            </div>
          </transition>
          <a-button type="primary" :loading="saving" class="w-full sm:w-auto !bg-primary-600 hover:!bg-primary-500 shadow-lg shadow-primary-500/20 border-none" @click="handleSave">
            <template #icon>
              <SaveOutlined />
            </template>
            保存配置
          </a-button>
        </div>
      </div>

      <!-- Tab导航 -->
      <a-tabs
        v-model:active-key="activeTab"
        size="small"
        :tab-bar-gutter="8"
        class="h-0 flex-1 [&_.ant-tabs-content]:h-full"
        :tab-bar-style="{ borderBottom: '1px solid rgba(255,255,255,0.05)' }"
      >
        <!-- 浏览器设置 -->
        <a-tab-pane key="browser" tab="浏览器设置">
          <div class="h-full overflow-y-auto custom-scrollbar p-2">
            <BrowserSettings
              :config="systemConfig!"
              @update:config="updateConfig"
            />
          </div>
        </a-tab-pane>

        <!-- 通知设置 -->
        <a-tab-pane key="notifications" tab="通知设置">
          <div class="h-full overflow-y-auto p-2">
            <NotificationSettings
              :config="systemConfig!"
              @update:config="updateConfig"
            />
          </div>
        </a-tab-pane>

        <!-- 商品评估器设置 -->
        <a-tab-pane key="evaluator" tab="评估器设置">
          <div class="h-full overflow-y-auto p-2">
            <EvaluatorSettings
              :config="systemConfig!"
              @update:config="updateConfig"
            />
          </div>
        </a-tab-pane>

        <!-- AI设置 -->
        <a-tab-pane key="ai" tab="AI设置" class="&_ant-tabs-content">
          <div class="h-full overflow-y-auto p-2">
            <AISettings />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
