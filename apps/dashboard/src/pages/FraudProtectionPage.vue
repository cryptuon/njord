<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="section-title mb-4">Fraud Protection</h1>
      <p class="section-subtitle mx-auto">
        Njord makes fraud economically irrational through staking, challenges, and automated detection
      </p>
    </div>

    <!-- Design Principles -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-20">
      <div v-for="p in principles" :key="p.title" class="card text-center">
        <h4 class="text-white font-medium text-sm mb-1">{{ p.title }}</h4>
        <p class="text-gray-500 text-xs">{{ p.desc }}</p>
      </div>
    </div>

    <!-- Attribution Lifecycle -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Attribution Lifecycle</h2>
      <div class="max-w-3xl mx-auto">
        <div class="flex flex-wrap justify-center gap-3 mb-8">
          <div v-for="state in states" :key="state.name" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="state.color" />
            <span class="text-sm text-gray-400">{{ state.name }}</span>
          </div>
        </div>
        <div class="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div v-for="(state, i) in lifecycle" :key="i" class="card text-center relative">
            <div class="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold" :class="state.color">
              {{ i + 1 }}
            </div>
            <h4 class="text-white text-xs font-semibold">{{ state.name }}</h4>
            <p class="text-gray-500 text-xs mt-1">{{ state.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Challenge System -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Challenge System</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">Who Can Challenge?</h3>
          <div class="space-y-3">
            <div v-for="c in challengers" :key="c.who" class="card">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-white font-medium text-sm">{{ c.who }}</h4>
                  <p class="text-gray-500 text-xs">{{ c.what }}</p>
                </div>
                <span class="badge badge-new text-xs">{{ c.bond }}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">Challenge Outcomes</h3>
          <div class="space-y-3">
            <div class="card border-red-900/50">
              <h4 class="text-red-400 font-medium text-sm mb-1">Fraud Confirmed</h4>
              <p class="text-gray-400 text-xs">Affiliate loses commission + stake slash. Challenger gets bond back + 50% of commission. Company gets 50% refunded.</p>
            </div>
            <div class="card border-green-900/50">
              <h4 class="text-green-400 font-medium text-sm mb-1">Challenge Rejected</h4>
              <p class="text-gray-400 text-xs">Affiliate gets commission + challenger's bond. Challenger loses bond. False accusations are penalized.</p>
            </div>
            <div class="card border-amber-900/50">
              <h4 class="text-amber-400 font-medium text-sm mb-1">Inconclusive</h4>
              <p class="text-gray-400 text-xs">Affiliate gets 50% commission. Challenger gets bond back (no reward). Company gets 50% refunded.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fraud Score -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Fraud Scoring</h2>
      <div class="card max-w-2xl mx-auto">
        <p class="text-gray-400 text-sm mb-6">Each attribution receives a fraud score from 0-100 based on multiple signals</p>
        <div class="space-y-4">
          <div v-for="range in fraudRanges" :key="range.label" class="flex items-center gap-4">
            <div class="w-24 text-right">
              <span class="text-sm font-mono" :class="range.textColor">{{ range.range }}</span>
            </div>
            <div class="flex-1 h-3 rounded-full" :class="range.bgColor" />
            <div class="w-48">
              <p class="text-white text-sm">{{ range.label }}</p>
              <p class="text-gray-500 text-xs">{{ range.action }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Common Scenarios -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Common Fraud Scenarios</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div v-for="s in scenarios" :key="s.name" class="card-hover">
          <h3 class="text-white font-semibold mb-2">{{ s.name }}</h3>
          <p class="text-gray-400 text-sm mb-3">{{ s.desc }}</p>
          <div>
            <p class="text-xs text-gray-500 font-medium mb-1">Detection:</p>
            <p class="text-xs text-gray-400">{{ s.detection }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const principles = [
  { title: 'Skin in the Game', desc: 'All participants stake value' },
  { title: 'Profitable Detection', desc: 'Catching fraud is rewarded' },
  { title: 'Decentralized', desc: 'Multiple parties can challenge' },
  { title: 'Economic Deterrence', desc: 'Fraud costs more than gains' },
  { title: 'Trust = Speed', desc: 'Higher trust, faster settlement' },
]

const states = [
  { name: 'Submitted', color: 'bg-blue-400' },
  { name: 'Pending', color: 'bg-amber-400' },
  { name: 'Challenged', color: 'bg-red-400' },
  { name: 'Settled', color: 'bg-green-400' },
]

const lifecycle = [
  { name: 'Submitted', desc: 'Bridge submits event', color: 'bg-blue-600/20 text-blue-400' },
  { name: 'Auto-Check', desc: 'Velocity & pattern checks', color: 'bg-surface-600 text-gray-300' },
  { name: 'Pending', desc: 'Normal hold period', color: 'bg-amber-600/20 text-amber-400' },
  { name: 'Challenge Window', desc: 'Open for disputes', color: 'bg-red-600/20 text-red-400' },
  { name: 'Resolution', desc: 'Dispute resolved', color: 'bg-purple-600/20 text-purple-400' },
  { name: 'Settled', desc: 'Commission paid', color: 'bg-green-600/20 text-green-400' },
]

const challengers = [
  { who: 'Company', what: 'Challenge their own campaign attributions', bond: '5% of commission' },
  { who: 'Bridge Operator', what: 'Challenge any attribution they processed', bond: '10% of commission' },
  { who: 'Other Affiliate', what: 'Challenge same-campaign attributions', bond: '15% of commission' },
  { who: 'Protocol (Auto)', what: 'Automated detection for any attribution', bond: 'No bond required' },
]

const fraudRanges = [
  { range: '0-20', label: 'Auto-approve', action: 'Fast settlement', textColor: 'text-green-400', bgColor: 'bg-green-600/30' },
  { range: '20-50', label: 'Standard', action: 'Normal hold period', textColor: 'text-amber-400', bgColor: 'bg-amber-600/30' },
  { range: '50-80', label: 'Suspicious', action: 'Extended hold + review', textColor: 'text-orange-400', bgColor: 'bg-orange-600/30' },
  { range: '80-100', label: 'Auto-reject', action: 'Requires verification', textColor: 'text-red-400', bgColor: 'bg-red-600/30' },
]

const scenarios = [
  { name: 'Cookie Stuffing', desc: 'Hidden iframes dropping cookies on unsuspecting users', detection: 'Low click-to-conversion time, high volume with low engagement, IP/session mismatches' },
  { name: 'Fake Signups', desc: 'Creating fake accounts to earn per-signup commissions', detection: 'Disposable email domains, phone verification failure, no subsequent platform engagement' },
  { name: 'Bot Traffic', desc: 'Using bots to generate fake clicks or signups', detection: 'Device fingerprint anomalies, inhuman behavioral patterns, IP clustering from data centers' },
  { name: 'Collusion', desc: 'Bridge operator and affiliate submitting fake attributions', detection: 'Cross-bridge comparison, unusual volume spikes, company transaction record mismatch' },
]
</script>
