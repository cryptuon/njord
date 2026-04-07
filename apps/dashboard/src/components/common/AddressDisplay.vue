<template>
  <div class="inline-flex items-center gap-1.5">
    <a
      :href="explorerUrl"
      target="_blank"
      rel="noopener"
      class="font-mono text-sm text-gray-400 hover:text-njord-400 transition-colors"
    >
      {{ formatted }}
    </a>
    <button
      @click="copy"
      class="text-gray-500 hover:text-gray-300 transition-colors"
      :title="copied ? 'Copied!' : 'Copy address'"
    >
      <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <svg v-else class="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNetworkStore } from '@/stores/network'
import { useFormatters } from '@/composables/useFormatters'

const props = defineProps<{ address: string; chars?: number }>()

const network = useNetworkStore()
const { formatAddress } = useFormatters()
const copied = ref(false)

const formatted = computed(() => formatAddress(props.address, props.chars || 4))
const explorerUrl = computed(() => network.explorerUrl(props.address))

async function copy() {
  await navigator.clipboard.writeText(props.address)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
