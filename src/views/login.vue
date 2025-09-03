<template>
  <div class="flex items-center justify-center h-screen bg-gray-100">
    <a-card class="w-96 shadow-lg rounded-2xl">
      <h2 class="text-center text-xl font-bold mb-6">咸鱼监控后台登录</h2>

      <a-form
        :model="form"
        layout="vertical"
        @finish="onSubmit"
      >
        <a-form-item
          name="username"
          label="用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input v-model:value="form.username" placeholder="请输入用户名"/>
        </a-form-item>

        <a-form-item
          name="password"
          label="密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model:value="form.password" placeholder="请输入密码"/>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="w-full"
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {message} from 'ant-design-vue'
import md5 from 'js-md5'
import {login} from '@/api/auth'
import {useRouter} from 'vue-router'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

async function onSubmit() {
  try {
    loading.value = true
    // @ts-expect-error
    await login(form.username, md5(form.password))
    message.success('登录成功')
    router.push('/')
  } catch (err: any) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
