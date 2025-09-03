<script setup lang="ts">
import {useApi} from "@/api/fetch";

const {data} = useApi('/api/status/goofish')

</script>

<template>
  <header class="flex-center border-b border-b-solid border-b-[#ddd] h-[64px] px-5">
    <a-dropdown>
      <template v-if="data">
        <a-button type="primary" class="ml-auto">已登录</a-button>
      </template>
      <template v-else>
        <a-button danger type="primary" class="ml-auto">
          咸鱼未登录(点击设置)
        </a-button>
      </template>
      <template #overlay>
        <a-menu>
          <a-menu-item></a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </header>
</template>

<style scoped>

</style>
