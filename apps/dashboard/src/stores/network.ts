import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { NETWORKS, DEFAULT_NETWORK, getExplorerUrl, getTxExplorerUrl, type NetworkId, type NetworkConfig } from '@/config/networks'
import { createGraphQLClient } from '@/graphql/client'

export const useNetworkStore = defineStore('network', () => {
  const currentNetwork = ref<NetworkId>(
    (localStorage.getItem('njord-network') as NetworkId) || DEFAULT_NETWORK
  )

  const config = computed<NetworkConfig>(() => NETWORKS[currentNetwork.value])
  const isDevnet = computed(() => currentNetwork.value === 'devnet')
  const isMainnet = computed(() => currentNetwork.value === 'mainnet')

  function switchNetwork(network: NetworkId) {
    currentNetwork.value = network
    localStorage.setItem('njord-network', network)
    createGraphQLClient(config.value.indexerUrl)
  }

  function explorerUrl(address: string) {
    return getExplorerUrl(address, currentNetwork.value)
  }

  function txExplorerUrl(signature: string) {
    return getTxExplorerUrl(signature, currentNetwork.value)
  }

  // Initialize GraphQL client
  createGraphQLClient(config.value.indexerUrl)

  return {
    currentNetwork,
    config,
    isDevnet,
    isMainnet,
    switchNetwork,
    explorerUrl,
    txExplorerUrl,
  }
})
