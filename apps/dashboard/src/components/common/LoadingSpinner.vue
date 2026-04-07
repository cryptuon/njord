<template>
  <div class="flex items-center justify-center py-12">
    <div class="relative">
      <div class="w-12 h-12 border-4 border-surface-700 rounded-full" />
      <div class="absolute inset-0 w-12 h-12 border-4 border-njord-500 border-t-transparent rounded-full animate-spin" />
    </div>
    <span v-if="message" class="ml-4 text-gray-400">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message?: string }>()
</script>
