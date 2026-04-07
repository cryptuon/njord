<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="section-title mb-4">Getting Started</h1>
      <p class="section-subtitle mx-auto">
        Step-by-step guides for each role in the Njord ecosystem
      </p>
    </div>

    <!-- Role Selector -->
    <div class="flex justify-center mb-12">
      <div class="inline-flex bg-surface-800 rounded-xl p-1 border border-surface-700">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="activeTab === tab.id ? 'bg-njord-600 text-white' : 'text-gray-400 hover:text-white'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Affiliate Guide -->
    <div v-if="activeTab === 'affiliate'" class="max-w-3xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">For Affiliates</h2>
        <p class="text-gray-400">Start earning commissions by promoting products through Njord</p>
      </div>

      <div class="mb-8 card">
        <h3 class="text-white font-semibold mb-4">What You'll Need</h3>
        <div class="grid sm:grid-cols-2 gap-3 text-sm">
          <div class="flex gap-2 text-gray-300"><span class="text-njord-400">&#10003;</span> Solana wallet (Phantom, Solflare, or Backpack)</div>
          <div class="flex gap-2 text-gray-300"><span class="text-njord-400">&#10003;</span> Small amount of SOL for fees (~0.001 SOL)</div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="(step, i) in affiliateSteps" :key="i" class="flex gap-4">
          <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 font-bold">{{ i + 1 }}</div>
          <div class="card flex-1">
            <h4 class="text-white font-medium mb-1">{{ step.title }}</h4>
            <p class="text-gray-400 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Guide -->
    <div v-if="activeTab === 'company'" class="max-w-3xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">For Companies</h2>
        <p class="text-gray-400">Launch your first affiliate marketing campaign on Njord</p>
      </div>

      <div class="mb-8 card">
        <h3 class="text-white font-semibold mb-4">What You'll Need</h3>
        <div class="grid sm:grid-cols-2 gap-3 text-sm">
          <div class="flex gap-2 text-gray-300"><span class="text-njord-400">&#10003;</span> Solana wallet or bridge account</div>
          <div class="flex gap-2 text-gray-300"><span class="text-njord-400">&#10003;</span> USDC/SOL for campaign budget</div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="(step, i) in companySteps" :key="i" class="flex gap-4">
          <div class="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 font-bold">{{ i + 1 }}</div>
          <div class="card flex-1">
            <h4 class="text-white font-medium mb-1">{{ step.title }}</h4>
            <p class="text-gray-400 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bridge Guide -->
    <div v-if="activeTab === 'bridge'" class="max-w-3xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">For Bridge Operators</h2>
        <p class="text-gray-400">Set up your bridge infrastructure and start earning</p>
      </div>

      <div class="mb-8 card">
        <h3 class="text-white font-semibold mb-4">What You'll Need</h3>
        <div class="grid sm:grid-cols-2 gap-3 text-sm">
          <div class="flex gap-2 text-gray-300"><span class="text-njord-400">&#10003;</span> Server infrastructure</div>
          <div class="flex gap-2 text-gray-300"><span class="text-njord-400">&#10003;</span> NJORD tokens for staking (min 10,000)</div>
          <div class="flex gap-2 text-gray-300"><span class="text-njord-400">&#10003;</span> Payment provider account (Stripe, etc.)</div>
          <div class="flex gap-2 text-gray-300"><span class="text-njord-400">&#10003;</span> Node.js/TypeScript experience</div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="(step, i) in bridgeSteps" :key="i" class="flex gap-4">
          <div class="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">{{ i + 1 }}</div>
          <div class="card flex-1">
            <h4 class="text-white font-medium mb-1">{{ step.title }}</h4>
            <p class="text-gray-400 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Network Info -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold text-white text-center mb-8">Network Information</h2>
      <div class="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div class="card">
          <h3 class="text-white font-semibold mb-3">Mainnet</h3>
          <div class="space-y-2 text-sm">
            <div><span class="text-gray-500">RPC: </span><span class="text-gray-300 font-mono text-xs">api.mainnet-beta.solana.com</span></div>
            <div><span class="text-gray-500">Explorer: </span><span class="text-gray-300">solscan.io</span></div>
          </div>
        </div>
        <div class="card">
          <h3 class="text-white font-semibold mb-3">Devnet (Testing)</h3>
          <div class="space-y-2 text-sm">
            <div><span class="text-gray-500">RPC: </span><span class="text-gray-300 font-mono text-xs">api.devnet.solana.com</span></div>
            <div><span class="text-gray-500">Faucet: </span><span class="text-gray-300">faucet.solana.com</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('affiliate')

const tabs = [
  { id: 'affiliate', label: 'Affiliate' },
  { id: 'company', label: 'Company' },
  { id: 'bridge', label: 'Bridge Operator' },
]

const affiliateSteps = [
  { title: 'Install a Solana Wallet', desc: 'Download Phantom (phantom.app), Solflare (solflare.com), or Backpack (backpack.app) as a browser extension or mobile app.' },
  { title: 'Secure Your Wallet', desc: 'Write down your seed phrase and store it safely. Never share it with anyone. This is your key to your earnings.' },
  { title: 'Get a Little SOL', desc: 'Transfer a small amount of SOL (0.01 is enough) from an exchange for transaction fees. On devnet, use the faucet.' },
  { title: 'Connect to Njord', desc: 'Visit the Njord dashboard and click "Connect Wallet." Select your wallet and approve the connection.' },
  { title: 'Browse Campaigns', desc: 'Explore available campaigns. Filter by commission rate, category, and minimum tier requirements.' },
  { title: 'Join & Promote', desc: 'Join a campaign to get your unique affiliate link. Share it through your content channels to start earning commissions.' },
]

const companySteps = [
  { title: 'Choose Your Path', desc: 'Connect a Solana wallet directly, or sign up with a bridge operator in your region for fiat-based campaigns.' },
  { title: 'Fund Your Account', desc: 'For crypto: fund your wallet with USDC or SOL. For fiat: deposit via credit card or bank transfer through your bridge.' },
  { title: 'Create a Campaign', desc: 'Set your budget, commission rate, target action (purchase/signup/install), and minimum affiliate tier.' },
  { title: 'Fund the Escrow', desc: 'Deposit funds into the on-chain escrow. This guarantees affiliates will be paid for valid conversions.' },
  { title: 'Share Campaign Details', desc: 'Provide product/service information, creative assets, and guidelines for affiliates to use in their promotions.' },
  { title: 'Monitor Performance', desc: 'Track real-time campaign performance in your dashboard. Manage affiliates and review conversions.' },
]

const bridgeSteps = [
  { title: 'Acquire NJORD Tokens', desc: 'Purchase at least 10,000 NJORD tokens from a DEX (Raydium, Orca) to meet the minimum Bronze tier stake requirement.' },
  { title: 'Stake Your Tokens', desc: 'Stake NJORD tokens using the CLI or dashboard. This registers you as a bridge operator on-chain.' },
  { title: 'Set Up Infrastructure', desc: 'Clone the bridge SDK, configure your environment, and deploy using Docker. Install PostgreSQL and Redis.' },
  { title: 'Integrate Payment Provider', desc: 'Connect your Stripe, Razorpay, or other payment gateway API keys. Configure webhook endpoints.' },
  { title: 'Register On-Chain', desc: 'Submit your bridge metadata (name, region, supported payment methods) to appear in the bridge directory.' },
  { title: 'Start Processing', desc: 'Begin processing attribution events. Monitor your dashboard for volume, reputation, and earnings.' },
]
</script>
