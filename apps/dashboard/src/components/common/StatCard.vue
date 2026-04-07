<template>
  <div class="stat-card">
    <div class="flex items-center justify-between">
      <span class="text-gray-400 text-sm">{{ label }}</span>
      <div v-if="trend" class="flex items-center gap-1 text-xs" :class="trend === 'up' ? 'text-green-400' : 'text-red-400'">
        <svg v-if="trend === 'up'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        {{ trendValue }}
      </div>
    </div>
    <div v-if="loading" class="h-8 bg-surface-700 rounded animate-pulse" />
    <p v-else class="text-2xl font-bold text-white">{{ value }}</p>
    <p v-if="subtitle" class="text-xs text-gray-500">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down'
  trendValue?: string
  loading?: boolean
}>()
</script>
