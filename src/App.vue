<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<template>
  <a-config-provider :locale="zhCN">
    <a-app class="w-full h-full">
      <router-view/>
    </a-app>
  </a-config-provider>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  font-weight: normal;
}
</style>
