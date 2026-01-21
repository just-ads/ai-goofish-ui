<template>
  <div class="flex items-center justify-center h-screen w-screen overflow-hidden relative">
    <!-- Background Animation -->
    <div class="absolute inset-0 bg-gray-900 overflow-hidden -z-10">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-900/20 blur-[100px] animate-pulse-slow"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-900/20 blur-[100px] animate-pulse-slow delay-1000"></div>
    </div>

    <div class="relative z-10 p-8 glass-card w-[400px] animate-fade-in-up">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/40">
            <!-- Icon placeholder or SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">欢迎回来</h2>
        <p class="text-gray-400 text-sm">闲鱼监控机器人后台管理系统</p>
      </div>

      <a-form
        :model="form"
        layout="vertical"
        @finish="onSubmit"
        class="space-y-4"
      >
        <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
          class="!mb-4"
        >
          <a-input
            v-model:value="form.username"
            placeholder="用户名"
            size="large"
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
          class="!mb-6"
        >
          <a-input-password
            v-model:value="form.password"
            placeholder="密码"
            size="large"
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item class="!mb-0">
          <a-button
            type="primary"
            html-type="submit"
            class="w-full !h-10 !rounded-lg !bg-gradient-to-r !from-primary-600 !to-primary-500 hover:!from-primary-500 hover:!to-primary-400 !border-0 shadow-lg shadow-primary-500/30 transition-all transform hover:scale-[1.02]"
            :loading="loading"
          >
            登录系统
          </a-button>
        </a-form-item>
      </a-form>

      <div class="mt-6 text-center text-xs text-gray-500">
        &copy; 2024 AI Goofish Monitor. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {saveUserToken} from "@/utils/user";
import {message} from 'ant-design-vue'
import md5 from 'js-md5'
import {useRouter} from 'vue-router'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

async function onSubmit() {
  loading.value = true
  const formData = new URLSearchParams()
  formData.append('username', form.username)
  // @ts-expect-error
  formData.append('password', md5(form.password))
  const {data} = await useApi('/api/auth/login').post(formData).json()
  loading.value = false
  if (data.value?.access_token) {
    saveUserToken(data.value.access_token)
    message.success('登录成功')
    router.push('/')
  }
}
</script>
