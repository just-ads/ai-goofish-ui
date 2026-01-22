<script setup lang="ts" generic="T extends AIConfig">
import {useApi} from "@/api/fetch";
import {AIConfig, AITemplate} from "@/types/ai";
import {safeStringify} from "@/utils/utils";
import {DeleteOutlined, DownOutlined, EditOutlined, PlusOutlined, ThunderboltOutlined, InfoCircleOutlined} from "@ant-design/icons-vue";
import {message} from "ant-design-vue";
import clone from "fast-clone";

const props = defineProps<{ modelValue: T }>()
const emit = defineEmits<{
  (e: "update:modelValue", value: T): void
}>();

const form = reactive({...props.modelValue})

const advancedVisible = ref(false);
const editingHeaders = ref(false);
const editingBody = ref(false);
const headersText = ref('');
const bodyText = ref('');

const {data: aiTemplates} = useApi('/api/ai/templates').json<AITemplate[]>();

watch(
  form,
  () => {
    emit('update:modelValue', {...form} as T)
  },
  {deep: true}
)

watch(() => form.headers, (newHeaders) => {
  headersText.value = safeStringify(newHeaders || {});
}, {immediate: true})

watch(() => form.body, (newBody) => {
  bodyText.value = safeStringify(newBody || {}, null, 2);
}, {immediate: true})

const applyTemplate = (id: string) => {
  if (!id) return;
  const template = aiTemplates.value?.find(it => it.id === id);
  if (!template) {
    return message.error('未找到模板')
  }
  form.endpoint = template.endpoint;
  form.model = template.model;
  form.headers = clone(template.headers);
  form.body = clone(template.body);
}

const addHeader = () => {
  if (!form.headers) {
    form.headers = {};
  }

  const key = prompt('请输入请求头的键名：');
  if (!key) return;

  const value = prompt('请输入请求头的值：');
  if (value === null) return;

  form.headers[key] = value;
  headersText.value = safeStringify(form.headers);
}

const removeHeader = (key: string) => {
  if (form.headers && form.headers[key]) {
    delete form.headers[key];
    headersText.value = safeStringify(form.headers);
  }
}

const editHeaders = () => {
  editingHeaders.value = true;
}

const saveHeaders = () => {
  try {
    form.headers = JSON.parse(headersText.value);
    editingHeaders.value = false;
    message.success('请求头保存成功');
  } catch (error) {
    message.error('JSON格式错误，请检查输入');
  }
}

const cancelEditHeaders = () => {
  headersText.value = safeStringify(form.headers || {});
  editingHeaders.value = false;
}

const editBody = () => {
  editingBody.value = true;
}

const saveBody = () => {
  try {
    form.body = JSON.parse(bodyText.value);
    editingBody.value = false;
    message.success('请求体保存成功');
  } catch (error) {
    message.error('JSON格式错误，请检查输入');
  }
}

const cancelEditBody = () => {
  bodyText.value = safeStringify(form.body || {});
  editingBody.value = false;
}

const testing = ref(false);
const testResult = ref<string | null>(null);
const testVisible = ref(false);

const testConfig = async () => {
  // 验证必填字段
  const missingFields = [];
  if (!form.name) missingFields.push('Agent名称');
  if (!form.endpoint) missingFields.push('API端点');
  if (!form.model) missingFields.push('模型名称');
  if (!form.api_key) missingFields.push('API密钥');

  if (missingFields.length > 0) {
    message.error(`请填写以下必填字段：${missingFields.join('、')}`);
    return;
  }

  try {
    testing.value = true;
    testResult.value = null;

    const testConfig = {
      id: 'test-' + Date.now(),
      name: form.name,
      endpoint: form.endpoint,
      api_key: form.api_key,
      model: form.model,
      proxy: form.proxy || '',
      headers: form.headers,
      body: form.body
    };

    const {error: testError, data: testData} = await useApi(`/api/ai/test`).post(testConfig).json();

    if (!testError.value && testData.value) {
      const response = testData.value.response || '测试成功';
      const name = testConfig.name;

      testResult.value = `✅ 连接测试成功！\n\n` +
        `名称: ${name}\n` +
        `模型: ${testConfig.model}\n` +
        `API端点: ${testConfig.endpoint}\n` +
        `测试响应: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`;
      message.success('连接测试成功');
    } else {
      testResult.value = `❌ 连接测试失败\n\n` +
        `错误信息: ${testError.value?.message || '未知错误'}\n` +
        `可能原因:\n` +
        `1. API密钥无效\n` +
        `2. 模型名称错误\n` +
        `3. API端点无法访问\n` +
        `4. 网络连接问题\n` +
        `5. 请求头/请求体配置错误`;
      message.error('连接测试失败');
    }

    testVisible.value = true;
  } catch (err: any) {
    testResult.value = `❌ 测试过程中发生错误\n\n` +
      `错误信息: ${err.message || '未知错误'}\n` +
      `可能原因:\n` +
      `1. 网络连接中断\n` +
      `2. 服务器无响应\n` +
      `3. 请求超时`;
    message.error('测试过程中发生错误');
    testVisible.value = true;
  } finally {
    testing.value = false;
  }
}

const closeTestResult = () => {
  testVisible.value = false;
  testResult.value = null;
}

// 暴露测试方法给父组件
defineExpose({
  testConfig: testConfig,
  testing,
  testResult,
  testVisible
});

</script>

<template>
  <div class="space-y-4">
    <a-form
      :model="form"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="名称" name="name" required>
        <a-input v-model:value="form.name" placeholder="输入名称"/>
      </a-form-item>

      <a-form-item label="模板选择">
        <a-select
          placeholder="选择预设模板"
          @change="applyTemplate"
          allow-clear
        >
          <a-select-option
            v-for="template in aiTemplates"
            :key="template.id"
            :value="template.id"
          >
            {{ template.name }} - {{template.description}}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="API端点" name="endpoint" required>
        <a-input v-model:value="form.endpoint" placeholder="https://api.openai.com/v1/chat/completions"/>
      </a-form-item>

      <a-form-item label="API密钥">
        <a-input-password v-model:value="form.api_key" placeholder="输入API密钥"/>
      </a-form-item>

      <a-form-item label="模型名称" name="model" required>
        <a-input v-model:value="form.model" placeholder="gpt-3.5-turbo"/>
      </a-form-item>

      <a-col align="right">
        <a-button
          type="link"
          @click="advancedVisible = !advancedVisible"
          class="p-0 h-auto"
        >
          {{ advancedVisible ? "收起" : "展开" }}高级配置
          <DownOutlined :class="{ 'rotate-180': advancedVisible }"/>
        </a-button>
      </a-col>

      <template v-if="advancedVisible">
        <a-form-item label="代理地址">
          <a-input v-model:value="form.proxy" placeholder="代理地址 http://proxy:port"/>
        </a-form-item>

        <a-form-item label="请求头配置">
          <div class="flex-col gap-2">
            <div v-if="form.headers && Object.keys(form.headers).length > 0" class="mb-2">
              <div v-for="(value, key) in form.headers" :key="key" class="flex items-center justify-between py-1 px-2 bg-gray-50 rounded mb-1">
                <span class="font-mono text-sm">
                  <span class="text-blue-600">{{ key }}</span>: <span class="text-green-600">{{ value }}</span>
                </span>
                <a-button type="text" danger size="small" @click="removeHeader(key)">
                  <DeleteOutlined/>
                </a-button>
              </div>
            </div>

            <div v-if="editingHeaders" class="flex-col gap-2">
              <a-textarea
                v-model:value="headersText"
                :rows="6"
                placeholder='输入JSON格式的请求头，例如：{"Authorization": "Bearer {key}", "Content-Type": "application/json"}'
              />
              <div class="flex gap-2">
                <a-button type="primary" @click="saveHeaders">保存</a-button>
                <a-button @click="cancelEditHeaders">取消</a-button>
              </div>
            </div>
            <div v-else class="flex gap-2">
              <a-button @click="addHeader" type="dashed">
                <PlusOutlined/>
                添加请求头
              </a-button>
              <a-button @click="editHeaders">
                <EditOutlined/>
                编辑JSON
              </a-button>
            </div>
          </div>
        </a-form-item>

        <a-form-item label="请求体配置">
          <div class="flex-col gap-2">
            <div v-if="editingBody" class="flex-col gap-2">
              <a-textarea
                v-model:value="bodyText"
                :rows="8"
                placeholder='输入JSON格式的请求体模板，例如：{"model": "{model}", "messages": {messages}, "temperature": 0.2}' 有好感
              />
              <div class="flex gap-2">
                <a-button type="primary" @click="saveBody">保存</a-button>
                <a-button @click="cancelEditBody">取消</a-button>
              </div>
            </div>
            <div v-else>
              <div class="mb-2">
                <pre class="bg-gray-50 text-black p-3 rounded text-sm overflow-auto max-h-40">{{ bodyText }}</pre>
              </div>
              <div class="flex gap-2">
                <a-button @click="editBody">
                  <EditOutlined/>
                  编辑请求体
                </a-button>
              </div>
            </div>
          </div>
        </a-form-item>
      </template>


      <!-- 操作按钮行 -->
      <a-form-item :wrapper-col="{ offset: 5, span: 18 }">
        <div class="flex items-center pt-4 border-t border-gray-200">
          <!-- 左侧：测试按钮 -->
          <div class="flex items-center gap-2">
            <a-button
              type="primary"
              @click="testConfig"
              :loading="testing"
              :disabled="!form.name || !form.endpoint || !form.model || !form.api_key"
            >
              <ThunderboltOutlined/>
              测试连接
            </a-button>

            <a-tooltip v-if="!form.name || !form.endpoint || !form.model || !form.api_key">
              <template #title>
                <div class="text-xs">
                  <div v-if="!form.name">请填写Agent名称</div>
                  <div v-if="!form.endpoint">请填写API端点</div>
                  <div v-if="!form.model">请填写模型名称</div>
                  <div v-if="!form.api_key">请填写API密钥</div>
                </div>
              </template>
              <InfoCircleOutlined class="text-gray-400"/>
            </a-tooltip>
          </div>

          <!-- 右侧：提示信息 -->
          <span class="text-gray-500 text-sm">
              测试通过后再保存
            </span>
        </div>
      </a-form-item>

      <!-- 测试结果（显示在操作按钮行下方） -->
      <a-form-item v-if="testVisible" :wrapper-col="{ offset: 5, span: 18 }">
        <div class="mt-2 p-4 border rounded" :class="testResult?.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-medium" :class="testResult?.includes('✅') ? 'text-green-700' : 'text-red-700'">
              {{ testResult?.includes('✅') ? '✅ 测试成功' : '❌ 测试失败' }}
            </h4>
            <a-button type="text" size="small" @click="closeTestResult">
              关闭
            </a-button>
          </div>
          <div class="text-sm whitespace-pre-wrap font-mono bg-white/50 p-3 rounded">
            <div v-if="testResult?.includes('✅')" class="space-y-2">
              <div class="text-green-700 font-medium">配置验证通过！</div>
              <div class="text-gray-700">{{ testResult.replace('✅ Agent连接测试成功！\n\n', '') }}</div>
            </div>
            <div v-else class="space-y-2">
              <div class="text-red-700 font-medium">配置验证失败</div>
              <div class="text-gray-700">{{ testResult?.replace('❌ ', '') }}</div>
              <div class="text-gray-600 text-xs mt-2">
                请检查以下配置：
                <ul class="list-disc pl-4 mt-1">
                  <li>API端点是否正确</li>
                  <li>API密钥是否有效</li>
                  <li>模型名称是否正确</li>
                  <li>网络连接是否正常</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>
