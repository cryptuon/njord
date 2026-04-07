<template>
  <router-link
    v-if="wallet.connected"
    to="/dashboard"
    class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-700 hover:bg-surface-600 transition-colors text-sm"
  >
    <span class="w-2 h-2 rounded-full bg-green-400" />
    <span class="font-mono text-gray-300">{{ wallet.shortAddress }}</span>
  </router-link>
  <router-link
    v-else
    to="/dashboard"
    class="btn-primary text-sm !px-4 !py-1.5"
  >
    Connect Wallet
  </router-link>
</template>

<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'

const wallet = useWalletStore()
</script>
