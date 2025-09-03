<script setup lang="ts">
import Header from '@/components/header.vue'

</script>

<template>
  <div class="layout">
    <Header/>
    <div class="main-container">
      <aside class="sidebar">
      </aside>
      <main class="content">
        <router-view/>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 200px;
}

.content {
  flex: 1;
}
</style>
