<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="section-title mb-4">Launch Transparent, Results-Driven Campaigns</h1>
      <p class="section-subtitle mx-auto">
        Create affiliate campaigns with on-chain escrow, automatic payouts, and built-in fraud protection.
        Only pay for verified conversions.
      </p>
    </div>

    <!-- Benefits -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
      <div v-for="b in benefits" :key="b.title" class="card-hover">
        <div class="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3" v-html="b.icon" />
        <h3 class="text-white font-semibold mb-1">{{ b.title }}</h3>
        <p class="text-gray-400 text-sm">{{ b.desc }}</p>
      </div>
    </div>

    <!-- Campaign Parameters -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Campaign Configuration</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="param in params" :key="param.name" class="card">
          <h4 class="text-white font-medium mb-1">{{ param.name }}</h4>
          <p class="text-gray-500 text-sm">{{ param.desc }}</p>
          <p class="text-njord-400 text-xs mt-2">{{ param.example }}</p>
        </div>
      </div>
    </div>

    <!-- Fee Structure -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-4">Simple Fee Structure</h2>
      <p class="text-gray-400 text-center mb-10">Only a small protocol fee on successful conversions</p>
      <div class="card max-w-2xl mx-auto">
        <div class="space-y-4">
          <div class="flex justify-between items-center py-2 border-b border-surface-700">
            <span class="text-gray-400">Customer purchases</span>
            <span class="text-white font-medium">$100.00</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-surface-700">
            <span class="text-gray-400">Commission (10%)</span>
            <span class="text-white font-medium">$10.00</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-surface-700">
            <span class="text-gray-400">Protocol fee (2%)</span>
            <span class="text-red-400 font-medium">-$0.20</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-surface-700">
            <span class="text-gray-400">Bridge fee (1%)</span>
            <span class="text-red-400 font-medium">-$0.10</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-white font-semibold">Affiliate receives</span>
            <span class="text-green-400 font-bold text-lg">$9.70</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Getting Started Paths -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Two Ways to Get Started</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="card-hover">
          <h3 class="text-lg font-semibold text-white mb-4">Crypto-Native</h3>
          <ol class="space-y-3 text-sm text-gray-400">
            <li class="flex gap-3"><span class="text-njord-400 font-bold">1.</span> Install a Solana wallet (Phantom, Solflare)</li>
            <li class="flex gap-3"><span class="text-njord-400 font-bold">2.</span> Fund wallet with USDC or SOL</li>
            <li class="flex gap-3"><span class="text-njord-400 font-bold">3.</span> Connect wallet to Njord dashboard</li>
            <li class="flex gap-3"><span class="text-njord-400 font-bold">4.</span> Create campaign and fund escrow</li>
          </ol>
        </div>
        <div class="card-hover">
          <h3 class="text-lg font-semibold text-white mb-4">Via Bridge (Fiat)</h3>
          <ol class="space-y-3 text-sm text-gray-400">
            <li class="flex gap-3"><span class="text-njord-400 font-bold">1.</span> Choose a bridge operator in your region</li>
            <li class="flex gap-3"><span class="text-njord-400 font-bold">2.</span> Create account on bridge platform</li>
            <li class="flex gap-3"><span class="text-njord-400 font-bold">3.</span> Configure campaign via bridge dashboard</li>
            <li class="flex gap-3"><span class="text-njord-400 font-bold">4.</span> Pay with credit card or bank transfer</li>
          </ol>
        </div>
      </div>
    </div>

    <div class="text-center">
      <router-link to="/getting-started" class="btn-primary">Get Started</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const benefits = [
  { title: 'Pay for Results', desc: 'Only pay commissions on verified conversions. No upfront ad spend risk.', icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' },
  { title: 'On-Chain Transparency', desc: 'Every attribution and payout is recorded on Solana for complete auditability.', icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>' },
  { title: 'Fraud Protection', desc: 'Built-in challenge system and fraud scoring. Bad actors get slashed, not rewarded.', icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>' },
  { title: 'Global Reach', desc: 'Bridge operators in multiple regions enable fiat payments from anywhere.', icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>' },
]

const params = [
  { name: 'Budget', desc: 'Total amount to allocate for affiliate payouts', example: 'e.g., 10,000 USDC' },
  { name: 'Commission Type', desc: 'Percentage of sale, flat fee per action, or tiered rates', example: 'e.g., 10% of sale value' },
  { name: 'Target Action', desc: 'What action triggers a commission', example: 'Purchase, Signup, App Install, Subscription' },
  { name: 'Attribution Model', desc: 'How credit is assigned for conversions', example: 'Last Click or First Click' },
  { name: 'Min Affiliate Tier', desc: 'Required reputation level for affiliates to join', example: 'New, Verified, Trusted, or Elite' },
  { name: 'Hold Period', desc: 'Time before commissions are released (fraud protection)', example: '0-7 days, customizable per campaign' },
]
</script>
