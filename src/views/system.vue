<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message, Modal} from "ant-design-vue";
import {PlusOutlined, DeleteOutlined, SettingOutlined, DownOutlined} from "@ant-design/icons-vue";

import type {SystemConfig, AgentConfig, AgentTemplate} from "@/types/system";
import AgentForm from "@/components/agentForm.vue";

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
    agents: [],
    evaluator: {
      enabled: true,
      textAgent: null,
      imagAgent: null
    }
  }
}).json<SystemConfig>();

const saving = ref(false);

const addAgentModal = () => {
  const agentConfig = ref<AgentConfig>({
    // 无用，防止ts类型错误
    id: '',
    name: "agent",
    endpoint: "",
    api_key: "",
    model: "",
    headers: {
      "Authorization": "Bearer {key}",
      "Content-Type": "application/json"
    },
    body: {
      "model": "{model}",
      "messages": "{messages}"
    }
  })

  Modal.confirm({
    title: '创建Agent',
    width: 520,
    content: h(AgentForm, {
      modelValue: agentConfig.value,
      'onUpdate:modelValue': (val: AgentConfig) => agentConfig.value = val
    }),
    onOk() {
      // console.log(agentConfig.value);
      // systemConfig.value!.agents.p
    }
  })
}


// 删除Agent
const deleteAgent = (index: number) => {
  // if (!systemConfig.value) return;
  // systemConfig.value.agents.splice(index, 1);
  // message.success('Agent已删除');
}

// 设置默认Agent
const setDefaultAgent = (index: number) => {
  // if (!systemConfig.value) return;
  // message.success('默认Agent已更新');
}

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
}
</script>

<template>
  <div class="p-4">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">系统设置</h2>
    </div>

    <!-- Tab导航 -->
    <a-tabs v-model:activeKey="activeTab" class="system-tabs">
      <!-- 浏览器设置 -->
      <a-tab-pane key="browser" tab="浏览器设置">
        <div class="space-y-4">
          <h3 class="text-lg font-medium">浏览器配置</h3>

          <a-form layout="vertical" class="max-w-2xl">
            <a-form-item label="无头模式">
              <a-switch v-model:checked="systemConfig!.browser.headless"/>
              <span class="ml-2 text-gray-500">是否在后台运行浏览器</span>
            </a-form-item>

            <a-form-item label="浏览器类型">
              <a-select v-model:value="systemConfig!.browser.channel" class="w-full">
                <a-select-option value="chrome">Chrome</a-select-option>
                <a-select-option value="firefox">Firefox</a-select-option>
                <a-select-option value="webkit">WebKit</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
      </a-tab-pane>

      <!-- 通知设置 -->
      <a-tab-pane key="notifications" tab="通知设置">
        <div class="space-y-4">
          <h3 class="text-lg font-medium">通知配置</h3>

          <a-form layout="vertical" class="max-w-2xl">
            <a-form-item label="启用通知">
              <a-switch v-model:checked="systemConfig!.notifications.enabled"/>
              <span class="ml-2 text-gray-500">是否启用消息通知功能</span>
            </a-form-item>

            <div v-if="systemConfig!.notifications.enabled">
              <!--              <a-form-item label="通知提供商">
                              <div class="space-y-2">
                                <div
                                  v-for="(provider, index) in systemConfig!.notifications.providers"
                                  :key="index"
                                  class="border rounded p-3 bg-gray-50"
                                >
                                  <div class="flex justify-between items-center">
                                    <span class="font-medium">{{ provider.type.toUpperCase() }}</span>
                                    <a-button
                                      type="text"
                                      danger
                                      @click="systemConfig!.notifications.providers.splice(index, 1)"
                                    >
                                      <DeleteOutlined />
                                    </a-button>
                                  </div>
                                </div>

                                <a-button type="dashed" class="w-full">
                                  <PlusOutlined />
                                  添加通知提供商
                                </a-button>
                              </div>
                            </a-form-item>-->
            </div>
          </a-form>
        </div>
      </a-tab-pane>

      <!-- Agent设置 -->
      <a-tab-pane key="agents" tab="Agent设置">
        <div class="space-y-4">
          <h3 class="text-lg font-medium">AI Agent配置</h3>
          <!-- Agent列表 -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <h4 class="text-md font-medium">已配置的Agent</h4>
              <a-button type="primary" @click="addAgentModal">
                <PlusOutlined/>
                添加Agent
              </a-button>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- 评估器设置 -->
      <a-tab-pane key="evaluator" tab="评估器设置">
        <div class="space-y-4">
          <h3 class="text-lg font-medium">商品评估器配置</h3>

          <a-form layout="vertical" class="max-w-2xl">
            <a-form-item label="启用评估器">
              <a-switch v-model:checked="systemConfig!.evaluator.enabled"/>
              <span class="ml-2 text-gray-500">是否启用AI商品分析评估</span>
            </a-form-item>

            <div v-if="systemConfig!.evaluator.enabled">
              <a-form-item label="文本分析Agent">
                <a-select
                  :value="systemConfig!.evaluator.textAgent || undefined"
                  @change="(value) => systemConfig!.evaluator.textAgent = value as string || null"
                  class="w-full"
                  placeholder="选择用于文本分析的Agent"
                  allow-clear
                >
                  <a-select-option
                    v-for="agent in systemConfig!.agents"
                    :key="agent.id"
                    :value="agent.id"
                  >
                    {{ agent.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="图像分析Agent">
                <a-select
                  :value="systemConfig!.evaluator.imagAgent || undefined"
                  @change="(value) => systemConfig!.evaluator.imagAgent = value as string || null"
                  class="w-full"
                  placeholder="选择用于图像分析的Agent"
                  allow-clear
                >
                  <a-select-option
                    v-for="agent in systemConfig!.agents"
                    :key="agent.id"
                    :value="agent.id"
                  >
                    {{ agent.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </a-form>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 保存按钮 -->
    <div class="fixed bottom-6 right-6">
      <a-button type="primary" size="large" @click="handleSave" :loading="saving">
        保存配置
      </a-button>
    </div>
  </div>
</template>
