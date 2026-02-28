<script setup lang="ts">
import {useApi} from "@/api/fetch";
import {message} from "ant-design-vue";

interface StartLoginResponse {
  session_id: string
  login_mode: 'auto' | 'manual'
  qrcode?: string
  timeout_seconds: number
}

interface CheckLoginResponse {
  status: 'pending' | 'success' | 'error'
  message: string | null
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}>()

const startLoading = ref(false)
const submitting = ref(false)
const sendingCode = ref(false)
const checkingLogin = ref(false)
const closingSession = ref(false)
const smsCooldown = ref(0)
const loginType = ref<'qr' | 'password' | 'sms'>('qr')
const sessionId = ref('')
const loginMode = ref<'auto' | 'manual'>('manual')
const qrCode = ref('')
const quickEnterMode = ref(false)
const loginError = ref('')

const form = reactive({
  username: '',
  password: '',
  phone: '',
  code: '',
})

let pollTimer: ReturnType<typeof setInterval> | null = null
let smsCooldownTimer: ReturnType<typeof setInterval> | null = null

const clearPoll = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const clearSmsCooldown = () => {
  if (smsCooldownTimer) {
    clearInterval(smsCooldownTimer)
    smsCooldownTimer = null
  }
  smsCooldown.value = 0
}

const startSmsCooldown = () => {
  clearSmsCooldown()
  smsCooldown.value = 60
  smsCooldownTimer = setInterval(() => {
    smsCooldown.value -= 1
    if (smsCooldown.value <= 0) {
      clearSmsCooldown()
    }
  }, 1000)
}

const resetState = () => {
  clearPoll()
  checkingLogin.value = false
  startLoading.value = false
  submitting.value = false
  sendingCode.value = false
  sessionId.value = ''
  loginMode.value = 'manual'
  qrCode.value = ''
  quickEnterMode.value = false
  loginError.value = ''
  clearSmsCooldown()
  loginType.value = 'qr'
  form.username = ''
  form.password = ''
  form.phone = ''
  form.code = ''
}

const closeLoginSession = async (sid: string) => {
  if (!sid) {
    return
  }

  await useApi('/api/goofish/close_login_session')
    .post({session_id: sid})
    .json()
}

const closeModal = async () => {
  if (closingSession.value) {
    return
  }

  closingSession.value = true
  const currentSessionId = sessionId.value
  emit('update:open', false)
  resetState()
  await closeLoginSession(currentSessionId)
  closingSession.value = false
}

const handleCancel = () => {
  void closeModal()
}

const handleLoginResult = async (result?: CheckLoginResponse | null) => {
  if (!result) {
    return
  }

  if (result.status === 'success') {
    clearPoll()
    emit('success')
    message.success('咸鱼登录成功')
    await closeModal()
    return
  }

  if (result.status === 'error') {
    loginError.value = result.message || '登录失败，请重试'
  }
}

const checkLogin = async () => {
  if (!sessionId.value || checkingLogin.value) {
    return
  }

  checkingLogin.value = true
  const {data, error} = await useApi('/api/goofish/check_login')
    .post({session_id: sessionId.value})
    .json<CheckLoginResponse>()
  checkingLogin.value = false

  if (error.value) {
    return
  }

  await handleLoginResult(data.value)
}

const startPoll = () => {
  clearPoll()
  pollTimer = setInterval(() => {
    void checkLogin()
  }, 2000)
}

const startGoofishLogin = async () => {
  startLoading.value = true
  loginError.value = ''

  const {data, error} = await useApi('/api/goofish/start_login')
    .post({timeout_seconds: 180})
    .json<StartLoginResponse>()

  startLoading.value = false
  if (error.value || !data.value) {
    return
  }

  sessionId.value = data.value.session_id
  loginMode.value = data.value.login_mode
  qrCode.value = data.value.qrcode || ''
  quickEnterMode.value = data.value.login_mode === 'auto' || !data.value.qrcode
  startPoll()
}

const sendSmsCode = async () => {
  if (!sessionId.value) {
    message.warning('登录会话不存在，请重新打开登录弹窗')
    return
  }
  if (!form.phone.trim()) {
    message.warning('请输入手机号')
    return
  }
  if (smsCooldown.value > 0) {
    return
  }

  sendingCode.value = true
  const {error} = await useApi('/api/goofish/send_sms_code')
    .post({session_id: sessionId.value, phone: form.phone.trim()})
    .json()
  sendingCode.value = false

  if (!error.value) {
    message.success('验证码已发送')
    startSmsCooldown()
  }
}

const submitGoofishLogin = async () => {
  if (!sessionId.value) {
    message.warning('登录会话不存在，请重新打开登录弹窗')
    return
  }

  const payload: Record<string, string> = {
    session_id: sessionId.value,
    login_type: loginType.value,
  }

  if (loginType.value === 'password') {
    if (!form.username.trim() || !form.password.trim()) {
      message.warning('请输入账号和密码')
      return
    }
    payload.username = form.username.trim()
    payload.password = form.password
  }

  if (loginType.value === 'sms') {
    if (!form.phone.trim() || !form.code.trim()) {
      message.warning('请输入手机号和验证码')
      return
    }
    payload.phone = form.phone.trim()
    payload.code = form.code.trim()
  }

  submitting.value = true
  loginError.value = ''
  const {data, error} = await useApi('/api/goofish/login').post(payload).json<CheckLoginResponse>()
  submitting.value = false

  if (error.value) {
    return
  }

  await handleLoginResult(data.value)
}

watch(() => props.open, (opened) => {
  if (opened) {
    void startGoofishLogin()
    return
  }
  resetState()
})

onBeforeUnmount(() => {
  clearPoll()
  clearSmsCooldown()
})
</script>

<template>
  <a-modal
    :open="open"
    title="登录咸鱼"
    :confirm-loading="submitting"
    :ok-button-props="{ disabled: closingSession }"
    :cancel-button-props="{ disabled: closingSession }"
    :cancel-text="closingSession ? '正在清理会话...' : '取消'"
    :closable="!closingSession"
    :mask-closable="!closingSession"
    :keyboard="!closingSession"
    :mask-style="{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.6)' }"
    wrap-class-name="dark-modal"
    @ok="submitGoofishLogin"
    @cancel="handleCancel"
  >
    <div class="py-4 flex-col gap-4">
      <div class="text-gray-400 text-sm">
        该登录仅用于获取咸鱼 Cookie
      </div>
      <a-spin :spinning="startLoading">
        <div class="flex-col gap-4">
          <a-radio-group v-if="loginMode === 'manual'" v-model:value="loginType" button-style="solid" class="w-full">
            <a-radio-button value="qr">
              扫码登录
            </a-radio-button>
            <a-radio-button value="sms">
              短信验证码
            </a-radio-button>
            <a-radio-button value="password">
              账号密码
            </a-radio-button>
          </a-radio-group>

          <div v-if="loginMode === 'auto'" class="w-full text-gray-300 text-sm bg-gray-700/40 border border-gray-600 rounded px-3 py-3">
            当前为自动登录流程，请等待自动登录完成。
          </div>

          <div v-if="loginMode === 'manual' && loginType === 'qr'" class="flex-col items-center gap-2">
            <img v-if="qrCode" :src="qrCode" alt="qrcode" class="w-40 h-40 rounded-lg border border-gray-700 bg-white p-2">
            <div class="text-xs text-gray-400">
              请使用闲鱼 App 扫码
            </div>
          </div>

          <div v-if="loginMode === 'manual' && loginType === 'password'" class="flex-col gap-3">
            <a-input v-model:value="form.username" placeholder="请输入账号"/>
            <a-input-password v-model:value="form.password" placeholder="请输入密码"/>
          </div>

          <div v-if="loginMode === 'manual' && loginType === 'sms'" class="flex-col gap-3">
            <a-input v-model:value="form.phone" placeholder="请输入手机号"/>
            <div class="flex gap-2">
              <a-input v-model:value="form.code" placeholder="请输入短信验证码"/>
              <a-button :loading="sendingCode" :disabled="smsCooldown > 0" @click="sendSmsCode">
                {{ smsCooldown > 0 ? `${smsCooldown}s后重试` : '获取验证码' }}
              </a-button>
            </div>
          </div>

          <div v-if="loginMode === 'manual' && loginType !== 'qr' && loginError"
               class="text-error text-sm bg-error/10 border border-error/20 rounded px-3 py-2">
            {{ loginError }}
          </div>

          <div v-if="closingSession" class="text-gray-300 text-sm bg-gray-700/40 border border-gray-600 rounded px-3 py-2">
            正在清理会话，请稍候...
          </div>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>
