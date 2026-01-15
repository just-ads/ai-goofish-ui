<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message, Modal} from "ant-design-vue";
import {PlusOutlined, DeleteOutlined, ThunderboltOutlined} from "@ant-design/icons-vue";
import type {AgentConfig} from "@/types/agent";
import AgentForm from "@/components/AgentForm.vue";

// 使用独立的API接口管理Agent配置
const {data: agents, execute: refreshAgents} = useApi('/api/agents', {
  initialData: []
}).json<AgentConfig[]>();

const loading = ref(false);
const testing = ref(false);

// 添加Agent的模态框
const addAgentModal = () => {
  const agentConfig = ref<AgentConfig>({
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
  });

  Modal.confirm({
    title: '创建Agent',
    width: 600,
    content: h(AgentForm, {
      modelValue: agentConfig.value,
      'onUpdate:modelValue': (val: AgentConfig) => agentConfig.value = val
    }),
    async onOk() {
      try {
        loading.value = true;
        const newAgent = agentConfig.value;

        // 通过API创建Agent
        const {error} = await useApi('/api/agents').post(newAgent).json();

        if (!error.value) {
          message.success('Agent已添加');
          await refreshAgents();
        } else {
          message.error('添加Agent失败');
        }
      } catch (err) {
        message.error('添加Agent时发生错误');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 删除Agent
const deleteAgent = (id: string) => {
  const agent = agents.value?.find(it => it.id === id);
  if (!agent) return;

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除Agent "${agent.name}" 吗？`,
    async onOk() {
      try {
        loading.value = true;
        const {error} = await useApi(`/api/agents/${agent.id}`).delete().json();

        if (!error.value) {
          message.success('Agent已删除');
          await refreshAgents();
        } else {
          message.error('删除Agent失败');
        }
      } catch (err) {
        message.error('删除Agent时发生错误');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 编辑Agent
const editAgent = (id: string) => {
  const agent = agents.value?.find(it => it.id === id);
  if (!agent) return;

  const agentConfig = ref<AgentConfig>(agent);

  Modal.confirm({
    title: '编辑Agent',
    width: 600,
    content: h(AgentForm, {
      modelValue: agentConfig.value,
      'onUpdate:modelValue': (val: AgentConfig) => agentConfig.value = val
    }),
    async onOk() {
      try {
        loading.value = true;
        // 通过API更新Agent
        const {error} = await useApi(`/api/agents/${agentConfig.value.id}`).post(agentConfig.value).json();

        if (!error.value) {
          message.success('Agent已更新');
          await refreshAgents();
        } else {
          message.error('更新Agent失败');
        }
      } catch (err) {
        message.error('更新Agent时发生错误');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 测试Agent连接
const testAgent = async (id: string) => {
  const agent = agents.value?.find(it => it.id === id);
  if (!agent) return;

  try {
    testing.value = true;
    const {error} = await useApi(`/api/agents/${agent.id}/test`).post().json();

    if (!error.value) {
      message.success('Agent连接测试成功');
    } else {
      message.error('Agent连接测试失败');
    }
  } catch (err) {
    message.error('测试Agent连接时发生错误');
  } finally {
    testing.value = false;
  }
};
</script>

<template>
  <div class="flex-col h-full space-y-4">
    <h3 class="text-lg font-medium">AI Agent配置</h3>

    <!-- Agent列表 -->
    <div class="flex-col flex-1">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-md font-medium">已配置的Agent</h4>
        <a-button type="primary" @click="addAgentModal" :loading="loading">
          <PlusOutlined/>
          添加Agent
        </a-button>
      </div>

      <div v-if="agents && agents.length > 0" class="space-y-3 h-0 flex-1 overflow-auto">
        <div
          v-for="agent in agents"
          :key="agent.id"
          class="border border-gray-200 rounded p-4 bg-white hover:border-blue-300 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h5 class="font-medium text-gray-800">{{ agent.name }}</h5>
                <span class="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {{ agent.model }}
                </span>
              </div>

              <div class="text-sm text-gray-600 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">端点:</span>
                  <code class="text-xs bg-gray-50 px-2 py-1 rounded truncate max-w-xs">
                    {{ agent.endpoint }}
                  </code>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">API密钥:</span>
                  <span class="text-xs">
                    {{ agent.api_key ? '••••••••' : '未设置' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-2 ml-4">
              <a-button
                type="primary"
                size="small"
                @click="editAgent(agent.id)"
                :disabled="testing"
              >
                编辑
              </a-button>
              <a-button
                type="default"
                size="small"
                @click="testAgent(agent.id)"
                :loading="testing"
              >
                <ThunderboltOutlined/>
                测试
              </a-button>
              <a-button
                type="text"
                danger
                size="small"
                @click="deleteAgent(agent.id)"
                :disabled="testing"
              >
                <DeleteOutlined/>
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 border border-dashed border-gray-300 rounded">
        <p class="text-gray-500 mb-4">尚未配置任何Agent</p>
        <a-button type="primary" @click="addAgentModal">
          <PlusOutlined/>
          添加第一个Agent
        </a-button>
      </div>
    </div>
  </div>
</template>
