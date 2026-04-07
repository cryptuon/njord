<template>
  <button
    @click="toggle"
    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
    :class="network.isDevnet
      ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50'
      : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'"
  >
    <span class="w-2 h-2 rounded-full" :class="network.isDevnet ? 'bg-amber-400' : 'bg-green-400'" />
    {{ network.config.name }}
  </button>
</template>

<script setup lang="ts">
import { useNetworkStore } from '@/stores/network'

const network = useNetworkStore()

function toggle() {
  network.switchNetwork(network.isDevnet ? 'mainnet' : 'devnet')
}
</script>
