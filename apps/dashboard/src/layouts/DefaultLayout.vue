<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
</script>
