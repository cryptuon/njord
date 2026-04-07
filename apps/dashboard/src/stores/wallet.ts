import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

export const useWalletStore = defineStore('wallet', () => {
  const { formatAddress } = useFormatters()

  const publicKey = ref<string | null>(null)
  const connected = ref(false)
  const connecting = ref(false)

  const shortAddress = computed(() =>
    publicKey.value ? formatAddress(publicKey.value) : ''
  )

  function setWallet(key: string | null) {
    publicKey.value = key
    connected.value = !!key
    connecting.value = false
  }

  function disconnect() {
    publicKey.value = null
    connected.value = false
  }

  return {
    publicKey,
    connected,
    connecting,
    shortAddress,
    setWallet,
    disconnect,
  }
})
