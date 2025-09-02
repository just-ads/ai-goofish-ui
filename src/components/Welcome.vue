<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { storeToRefs } from "pinia";
import { useCounterStore } from "@/store";
const counterStore = useCounterStore();
const { count } = storeToRefs(counterStore);
</script>

<template>
  <header>
    <img
      alt="antDesignVue logo"
      class="logo"
      src="@/assets/antDesignVue.svg"
      width="250"
      height="150"
    />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">
          <a-button type="primary">Home</a-button>
        </RouterLink>
        <RouterLink to="/about">
          <a-button type="primary">About</a-button>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
