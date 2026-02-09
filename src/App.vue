<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { theme } from 'ant-design-vue';
import {useUiThemeStore} from '@/store';

type AntToken = Record<string, string | number | boolean>

const uiTheme = useUiThemeStore()

const readCssVar = (name: string) => {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
}

const rgb = (name: string, alpha?: number, fallback?: string) => {
  const v = readCssVar(name)
  if (!v) return fallback ?? ''
  return typeof alpha === 'number' ? `rgb(${v} / ${alpha})` : `rgb(${v})`
}

const buildAntTokens = (): AntToken => {
  const primary = rgb('primary-500', undefined, '#1890ff')
  const info = rgb('info', undefined, '#1890ff') || primary
  const success = rgb('success', undefined, '#52c41a')
  const warning = rgb('warning', undefined, '#faad14')
  const error = rgb('error', undefined, '#ff4d4f')

  const text = rgb('gray-100', undefined, '#f5f5f5')
  const textSecondary = rgb('gray-400', undefined, '#bfbfbf')
  const textTertiary = rgb('gray-500', undefined, '#8c8c8c')
  const textQuaternary = rgb('gray-600', undefined, '#595959')

  const bgBase = rgb('gray-950', undefined, '#141414')
  const bgContainer = rgb('gray-900', undefined, '#1f1f1f')

  return {
    colorPrimary: primary,
    colorInfo: info,
    colorSuccess: success,
    colorWarning: warning,
    colorError: error,

    colorBgBase: bgBase,
    colorBgContainer: bgContainer,

    // Explicit text tokens: avoid dark text on dark backgrounds
    colorTextBase: text,
    colorText: text,
    colorTextSecondary: textSecondary,
    colorTextTertiary: textTertiary,
    colorTextQuaternary: textQuaternary,
    colorTextHeading: text,
    colorTextLabel: rgb('gray-200', undefined, '#e8e8e8'),
    colorTextDescription: textSecondary,
    colorTextPlaceholder: rgb('gray-600', undefined, '#595959'),
    colorTextDisabled: rgb('gray-600', 0.6, 'rgba(89, 89, 89, 0.6)'),

    borderRadius: 8,
    wireframe: false,
  }
}

const appTheme = shallowRef({
  algorithm: theme.darkAlgorithm,
  token: buildAntTokens(),
  components: {
    Layout: {
      colorBgHeader: 'transparent',
      colorBgBody: 'transparent',
      colorBgTrigger: rgb('gray-900') || '#1f1f1f',
    },
    Menu: {
      colorItemBg: 'transparent',
      colorSubItemBg: 'transparent',
    }
  }
})

const syncAntThemeFromCssVars = () => {
  appTheme.value = {
    algorithm: uiTheme.theme.mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: buildAntTokens(),
    components: {
      Layout: {
        colorBgHeader: 'transparent',
        colorBgBody: 'transparent',
        colorBgTrigger: rgb('gray-900') || '#1f1f1f',
      },
      Menu: {
        colorItemBg: 'transparent',
        colorSubItemBg: 'transparent',
      }
    }
  }
}

onMounted(() => {
  syncAntThemeFromCssVars()
})

watch(
  () => [uiTheme.theme.mode, uiTheme.theme.accent],
  async () => {
    await nextTick()
    syncAntThemeFromCssVars()
  },
  {immediate: true}
)
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="appTheme">
    <a-app class="wh-full font-sans">
      <router-view />
    </a-app>
  </a-config-provider>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  font-weight: normal;
  /* Ensure the global gradient from theme.css shines through if needed,
     but we also set bg-gray-950 on a-app as a fallback */
}
</style>
