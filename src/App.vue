<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { theme } from 'ant-design-vue';

const appTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    colorInfo: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorBgBase: '#141414',
    colorBgContainer: '#1f1f1f',
    colorTextBase: '#e6f7ff',
    borderRadius: 8,
    wireframe: false,
  },
  components: {
    Layout: {
      colorBgHeader: 'transparent',
      colorBgBody: 'transparent',
      colorBgTrigger: '#1f1f1f',
    },
    Menu: {
      colorItemBg: 'transparent',
      colorSubItemBg: 'transparent',
    }
  }
}
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="appTheme">
    <a-app class="w-full h-full font-sans text-gray-100 bg-gray-950">
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
