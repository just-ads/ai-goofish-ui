<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message} from "ant-design-vue";
import type {SystemConfig} from "@/types/system";

// 导入新的模块组件
import BrowserSettings from "@/components/BrowserSettings.vue";
import NotificationSettings from "@/components/NotificationSettings.vue";
import AgentSettings from "@/components/AgentSettings.vue";
import EvaluatorSettings from "@/components/EvaluatorSettings.vue";

const activeTab = ref('browser');

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
      textAgent: null,
      imagAgent: null
    }
  }
}).json<SystemConfig>();

const saving = ref(false);

// 更新配置
const updateConfig = (newConfig: SystemConfig) => {
  systemConfig.value = newConfig;
};

// 保存系统配置
const handleSave = async () => {
  saving.value = true;
  const {error} = await useApi('api/system').post(systemConfig.value).json();
  saving.value = false;

  if (!error.value) {
    message.success("保存成功");
    await refreshConfig();
  } else {
    message.error("保存失败");
  }
};
</script>

<template>
  <div class="flex-col p-4 h-full">
    <!-- 页面标题 -->
    <div class="flex justify-between mb-6">
      <h2 class="text-xl font-semibold mb-2">系统设置</h2>
      <a-button type="primary" size="large" @click="handleSave" :loading="saving">
        保存配置
      </a-button>
    </div>

    <!-- Tab导航 -->
    <a-tabs v-model:activeKey="activeTab" class="h-0 flex-1 [&>.ant-tabs-content]:h-full">
      <!-- 浏览器设置 -->
      <a-tab-pane key="browser" tab="浏览器设置">
        <BrowserSettings
          :config="systemConfig!"
          @update:config="updateConfig"
        />
      </a-tab-pane>

      <!-- 通知设置 -->
      <a-tab-pane key="notifications" tab="通知设置">
        <NotificationSettings
          :config="systemConfig!"
          @update:config="updateConfig"
        />
      </a-tab-pane>

      <!-- Agent设置 -->
      <a-tab-pane key="agents" tab="Agent设置">
        <AgentSettings/>
      </a-tab-pane>

      <!-- 评估器设置 -->
      <a-tab-pane key="evaluator" tab="评估器设置">
        <EvaluatorSettings
          :config="systemConfig!"
          @update:config="updateConfig"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
