#!/bin/sh
# Generate runtime environment configuration
# This allows env vars to be set at container runtime, not just build time

cat > /usr/share/nginx/html/env-config.js << EOF
window.__ENV__ = {
  VITE_DEVNET_RPC_URL: "${VITE_DEVNET_RPC_URL:-https://api.devnet.solana.com}",
  VITE_DEVNET_INDEXER_URL: "${VITE_DEVNET_INDEXER_URL:-http://localhost:4000}",
  VITE_MAINNET_RPC_URL: "${VITE_MAINNET_RPC_URL:-https://api.mainnet-beta.solana.com}",
  VITE_MAINNET_INDEXER_URL: "${VITE_MAINNET_INDEXER_URL:-https://indexer.njord.cryptuon.com}",
  VITE_DEFAULT_NETWORK: "${VITE_DEFAULT_NETWORK:-devnet}"
};
EOF

exec "$@"
