export interface NetworkConfig {
  name: string
  rpcUrl: string
  indexerUrl: string
  programId: string
  explorerBase: string
}

export type NetworkId = 'devnet' | 'mainnet'

function getEnv(key: string, fallback: string): string {
  return window.__ENV__?.[key] || import.meta.env[key] || fallback
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  devnet: {
    name: 'Devnet',
    rpcUrl: getEnv('VITE_DEVNET_RPC_URL', 'https://api.devnet.solana.com'),
    indexerUrl: getEnv('VITE_DEVNET_INDEXER_URL', 'http://localhost:4000'),
    programId: 'Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv',
    explorerBase: 'https://solscan.io',
  },
  mainnet: {
    name: 'Mainnet',
    rpcUrl: getEnv('VITE_MAINNET_RPC_URL', 'https://api.mainnet-beta.solana.com'),
    indexerUrl: getEnv('VITE_MAINNET_INDEXER_URL', 'https://indexer.njord.cryptuon.com'),
    programId: 'Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv',
    explorerBase: 'https://solscan.io',
  },
}

export const DEFAULT_NETWORK: NetworkId =
  (getEnv('VITE_DEFAULT_NETWORK', 'devnet') as NetworkId) || 'devnet'

export function getExplorerUrl(address: string, network: NetworkId): string {
  const base = NETWORKS[network].explorerBase
  const cluster = network === 'devnet' ? '?cluster=devnet' : ''
  return `${base}/account/${address}${cluster}`
}

export function getTxExplorerUrl(signature: string, network: NetworkId): string {
  const base = NETWORKS[network].explorerBase
  const cluster = network === 'devnet' ? '?cluster=devnet' : ''
  return `${base}/tx/${signature}${cluster}`
}
