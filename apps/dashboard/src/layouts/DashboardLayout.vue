<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <div class="flex-1 flex">
      <AppSidebar />
      <main class="flex-1 p-6 lg:p-8 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from './components/AppNavbar.vue'
import AppSidebar from './components/AppSidebar.vue'
</script>
