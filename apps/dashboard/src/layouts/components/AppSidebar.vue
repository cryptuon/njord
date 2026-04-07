<template>
  <aside class="hidden lg:flex flex-col w-64 border-r border-surface-700 bg-surface-800/50 p-4">
    <nav class="space-y-1">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="activeSection = item.id"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
        :class="activeSection === item.id
          ? 'bg-njord-600/20 text-njord-400'
          : 'text-gray-400 hover:text-white hover:bg-surface-700'"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.label }}
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'

const activeSection = ref('overview')

const ChartIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
])

const WalletIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' })
])

const CampaignIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
])

const ActivityIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' })
])

const menuItems = [
  { id: 'overview', label: 'Overview', icon: ChartIcon },
  { id: 'earnings', label: 'Earnings', icon: WalletIcon },
  { id: 'campaigns', label: 'My Campaigns', icon: CampaignIcon },
  { id: 'activity', label: 'Activity', icon: ActivityIcon },
]
</script>
