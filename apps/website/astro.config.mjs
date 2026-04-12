import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: 'https://njord.cryptuon.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    vue(),
    sitemap({
      filter: (page) => !page.includes('/dashboard'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
    tailwind(),
  ],
  vite: {
    resolve: {
      alias: {
        '@dashboard': new URL('../../apps/dashboard/src', import.meta.url).pathname,
      },
    },
  },
})
