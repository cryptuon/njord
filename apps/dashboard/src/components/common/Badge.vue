<template>
  <span :class="badgeClass">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  variant?: 'gray' | 'blue' | 'purple' | 'amber' | 'green' | 'red' | 'yellow'
}>()

const badgeClass = computed(() => {
  const base = 'badge'
  const variants: Record<string, string> = {
    gray: 'bg-gray-700 text-gray-300',
    blue: 'bg-blue-900/50 text-blue-400',
    purple: 'bg-purple-900/50 text-purple-400',
    amber: 'bg-amber-900/50 text-amber-400',
    green: 'bg-green-900/50 text-green-400',
    red: 'bg-red-900/50 text-red-400',
    yellow: 'bg-yellow-900/50 text-yellow-400',
  }
  return `${base} ${variants[props.variant || 'gray']}`
})
</script>
