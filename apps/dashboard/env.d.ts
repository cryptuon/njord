/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_DEVNET_RPC_URL: string
  readonly VITE_DEVNET_INDEXER_URL: string
  readonly VITE_MAINNET_RPC_URL: string
  readonly VITE_MAINNET_INDEXER_URL: string
  readonly VITE_DEFAULT_NETWORK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __ENV__?: Record<string, string>
}
