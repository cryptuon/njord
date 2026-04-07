<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex justify-between text-sm mb-1">
      <span class="text-gray-400">{{ label }}</span>
      <span class="text-gray-300">{{ Math.round(percentage) }}%</span>
    </div>
    <div class="h-2 bg-surface-700 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="barColor"
        :style="{ width: `${Math.min(100, percentage)}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  percentage: number
  label?: string
  showLabel?: boolean
  color?: 'njord' | 'green' | 'amber' | 'red'
}>()

const barColor = computed(() => {
  const colors: Record<string, string> = {
    njord: 'bg-gradient-to-r from-njord-500 to-njord-400',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }
  return colors[props.color || 'njord']
})
</script>
