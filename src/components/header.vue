<script setup lang="ts">
import {isLoginGoofish} from "@/api/goofish";

const open = ref<boolean>(false);
const {data} = await isLoginGoofish();

const showModal = () => {
  open.value = true;
};

const handleOk = () => {

}

</script>

<template>
  <header class="flex-center border-b border-b-solid border-b-[#ddd] h-[64px] px-5">
    <a-dropdown v-if="data">
      <a-button type="primary" class="ml-auto">已登录</a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item></a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <template v-else>
      <a-button danger type="primary" class="ml-auto" @click="showModal">咸鱼未登录(点击设置)</a-button>
      <a-modal title="更新Cooking" v-model:open="open" cancelText="取消" okText="确定" @ok="handleOk">
        <textarea class="w-full h-[200px]"/>
      </a-modal>
    </template>
  </header>
</template>

<style scoped>

</style>
