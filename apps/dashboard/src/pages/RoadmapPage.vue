<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="section-title mb-4">Roadmap</h1>
      <p class="section-subtitle mx-auto">
        The development journey from foundation to global scale
      </p>
    </div>

    <!-- Timeline -->
    <div class="max-w-3xl mx-auto">
      <div v-for="(phase, i) in phases" :key="i" class="flex gap-6 mb-8">
        <div class="flex flex-col items-center">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0"
            :class="phase.current ? 'bg-njord-600 text-white' : 'bg-surface-700 text-gray-400'"
          >
            {{ i + 1 }}
          </div>
          <div v-if="i < phases.length - 1" class="w-0.5 flex-1 mt-2" :class="phase.current ? 'bg-njord-600' : 'bg-surface-700'" />
        </div>
        <div class="card flex-1 mb-2" :class="phase.current ? 'border-njord-600/50' : ''">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-xl font-semibold text-white">{{ phase.title }}</h3>
            <span v-if="phase.current" class="badge bg-njord-900/50 text-njord-400">Current</span>
          </div>
          <p class="text-gray-400 text-sm mb-4">{{ phase.focus }}</p>
          <div class="space-y-2">
            <div v-for="item in phase.items" :key="item" class="flex items-start gap-2 text-sm">
              <span class="text-gray-600 mt-0.5">&#9679;</span>
              <span class="text-gray-400">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Metrics -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Success Metrics</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card text-center">
          <p class="text-gray-400 text-sm">Bridge Operators</p>
          <p class="text-3xl font-bold text-white">20+</p>
          <p class="text-xs text-gray-500">Global coverage</p>
        </div>
        <div class="stat-card text-center">
          <p class="text-gray-400 text-sm">Active Campaigns</p>
          <p class="text-3xl font-bold text-white">1,000+</p>
          <p class="text-xs text-gray-500">Across categories</p>
        </div>
        <div class="stat-card text-center">
          <p class="text-gray-400 text-sm">Monthly Volume</p>
          <p class="text-3xl font-bold text-white">$10M+</p>
          <p class="text-xs text-gray-500">Attribution volume</p>
        </div>
        <div class="stat-card text-center">
          <p class="text-gray-400 text-sm">Active Affiliates</p>
          <p class="text-3xl font-bold text-white">50,000+</p>
          <p class="text-xs text-gray-500">Earning commissions</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const phases = [
  {
    title: 'Phase 1: Foundation',
    focus: 'Core protocol development on Solana',
    current: true,
    items: [
      'Core smart contracts (Campaign, Affiliate, Attribution, Escrow)',
      'Bridge registry with staking and reputation',
      'NJORD SPL token with governance',
      'TypeScript SDK (@njord/sdk)',
    ],
  },
  {
    title: 'Phase 2: Bridge Infrastructure',
    focus: 'Enable bridge operators to run infrastructure',
    current: false,
    items: [
      'Bridge operator SDK with payment gateway abstraction',
      'Reference bridge implementation (Stripe, Razorpay)',
      'CLI tools for bridge management',
      'Comprehensive operator documentation',
    ],
  },
  {
    title: 'Phase 3: Launch Preparation',
    focus: 'Security, testing, and beta program',
    current: false,
    items: [
      'Two independent security audits',
      'Beta program with selected partners',
      'Company and affiliate frontend applications',
      'Event indexer with GraphQL API',
    ],
  },
  {
    title: 'Phase 4: Mainnet Launch',
    focus: 'Public launch and initial growth',
    current: false,
    items: [
      'Token Generation Event and DEX liquidity',
      'Mainnet contract deployment with multi-sig',
      'Bridge operator onboarding (5-10 operators)',
      'Community building and marketing',
    ],
  },
  {
    title: 'Phase 5: Growth & Expansion',
    focus: 'Feature expansion and ecosystem growth',
    current: false,
    items: [
      'Multi-touch attribution and ML fraud detection',
      'E-commerce integrations (Shopify, WooCommerce)',
      'Mobile SDK and advanced analytics suite',
      'On-chain governance UI and delegation',
    ],
  },
]
</script>
