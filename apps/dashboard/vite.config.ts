import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util'],
      globals: { Buffer: true },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env': {},
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress unresolved import warnings from node polyfills
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.exporter?.includes('unenv')) {
          return
        }
        warn(warning)
      },
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
})
