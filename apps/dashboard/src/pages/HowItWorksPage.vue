<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="section-title mb-4">How Njord Works</h1>
      <p class="section-subtitle mx-auto">
        A step-by-step walkthrough of how decentralized affiliate marketing works on Solana
      </p>
    </div>

    <!-- Protocol Flow Steps -->
    <div class="max-w-3xl mx-auto space-y-8 mb-20">
      <div v-for="(step, i) in flowSteps" :key="i" class="flex gap-6">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
               :class="step.color">
            {{ i + 1 }}
          </div>
          <div v-if="i < flowSteps.length - 1" class="w-0.5 flex-1 bg-surface-700 mt-2" />
        </div>
        <div class="card flex-1 mb-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge text-xs" :class="step.actorBadge">{{ step.actor }}</span>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">{{ step.title }}</h3>
          <p class="text-gray-400">{{ step.description }}</p>
        </div>
      </div>
    </div>

    <!-- Settlement Speed -->
    <div class="card bg-gradient-to-r from-njord-950 to-surface-800 mb-20">
      <div class="text-center py-8">
        <h2 class="text-2xl font-bold text-white mb-2">Real-Time Settlement</h2>
        <p class="text-gray-400 mb-6">From purchase to commission in approximately 3 seconds</p>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
          <div v-for="(t, i) in timeline" :key="i" class="text-center">
            <p class="text-njord-400 font-mono text-sm mb-1">{{ t.time }}</p>
            <p class="text-white text-sm font-medium">{{ t.action }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Alternative Flows -->
    <div class="mb-16">
      <h2 class="section-title text-center mb-10">Participation Paths</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="card-hover">
          <h3 class="text-lg font-semibold text-white mb-3">Crypto-Native</h3>
          <p class="text-gray-400 text-sm mb-4">For users with Solana wallets. Connect directly, receive USDC/SOL commissions to your wallet.</p>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> Direct wallet connection
            </div>
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> Instant USDC payouts
            </div>
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> Full on-chain transparency
            </div>
          </div>
        </div>
        <div class="card-hover">
          <h3 class="text-lg font-semibold text-white mb-3">Via Bridge (Fiat)</h3>
          <p class="text-gray-400 text-sm mb-4">For mainstream users. Pay and get paid in your local currency through bridge operators.</p>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> No wallet required
            </div>
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> Credit card / bank transfer
            </div>
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> Withdraw to bank account
            </div>
          </div>
        </div>
        <div class="card-hover">
          <h3 class="text-lg font-semibold text-white mb-3">Hybrid</h3>
          <p class="text-gray-400 text-sm mb-4">The most common scenario. Companies pay via bridge, affiliates receive crypto directly.</p>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> Flexible for all parties
            </div>
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> Best of both worlds
            </div>
            <div class="flex items-center gap-2 text-gray-300">
              <span class="text-green-400">&#10003;</span> Most common setup
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="text-center">
      <router-link to="/getting-started" class="btn-primary">Get Started Now</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const flowSteps = [
  { actor: 'Company', title: 'Create Campaign', description: 'A company creates a new affiliate campaign, setting the budget, commission rate, target action (purchase, signup, etc.), and affiliate requirements. Campaign parameters are stored on-chain.', color: 'bg-purple-600/20 text-purple-400', actorBadge: 'bg-purple-900/50 text-purple-400' },
  { actor: 'Company', title: 'Fund Escrow', description: 'The company deposits USDC or SOL into a secure on-chain escrow account tied to the campaign. Funds are locked until distributed to affiliates or the campaign ends.', color: 'bg-purple-600/20 text-purple-400', actorBadge: 'bg-purple-900/50 text-purple-400' },
  { actor: 'Affiliate', title: 'Join Campaign', description: 'Affiliates browse available campaigns and join ones that match their audience. They receive a unique affiliate ID for tracking. Some campaigns require approval, others are open.', color: 'bg-blue-600/20 text-blue-400', actorBadge: 'bg-blue-900/50 text-blue-400' },
  { actor: 'Affiliate', title: 'Share & Promote', description: 'Affiliates generate unique tracking links and share them with their audience through blogs, social media, videos, or newsletters. Every click is tracked.', color: 'bg-blue-600/20 text-blue-400', actorBadge: 'bg-blue-900/50 text-blue-400' },
  { actor: 'Customer', title: 'Customer Acts', description: 'A customer clicks an affiliate link and completes the target action (makes a purchase, signs up, installs an app). The experience is seamless - customers don\'t need a wallet.', color: 'bg-green-600/20 text-green-400', actorBadge: 'bg-green-900/50 text-green-400' },
  { actor: 'Bridge', title: 'Record Attribution', description: 'The bridge operator (or company SDK) records the conversion event on Solana. The smart contract validates the campaign, affiliate, and escrow, then calculates the commission.', color: 'bg-amber-600/20 text-amber-400', actorBadge: 'bg-amber-900/50 text-amber-400' },
  { actor: 'Protocol', title: 'Commission Paid', description: 'The smart contract automatically releases the commission from escrow to the affiliate\'s wallet, minus a small protocol fee (2.5%) and bridge fee (1%). The entire process takes ~3 seconds.', color: 'bg-njord-600/20 text-njord-400', actorBadge: 'bg-njord-900/50 text-njord-400' },
]

const timeline = [
  { time: 'T+0s', action: 'Customer clicks "Buy"' },
  { time: 'T+2s', action: 'Payment confirmed' },
  { time: 'T+2.5s', action: 'Attribution submitted' },
  { time: 'T+3s', action: 'On-chain confirmed' },
  { time: 'T+3s', action: 'Commission released' },
]
</script>
