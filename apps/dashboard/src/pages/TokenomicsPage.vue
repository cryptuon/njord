<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="section-title mb-4">NJORD Token</h1>
      <p class="section-subtitle mx-auto">
        The utility and governance token powering the Njord ecosystem
      </p>
    </div>

    <!-- Token Overview -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
      <div class="stat-card">
        <span class="text-gray-400 text-sm">Total Supply</span>
        <p class="text-2xl font-bold text-white">1,000,000,000</p>
        <p class="text-xs text-gray-500">1 Billion NJORD</p>
      </div>
      <div class="stat-card">
        <span class="text-gray-400 text-sm">Blockchain</span>
        <p class="text-2xl font-bold text-white">Solana</p>
        <p class="text-xs text-gray-500">SPL Token</p>
      </div>
      <div class="stat-card">
        <span class="text-gray-400 text-sm">Type</span>
        <p class="text-2xl font-bold text-white">Utility</p>
        <p class="text-xs text-gray-500">Utility & Governance</p>
      </div>
      <div class="stat-card">
        <span class="text-gray-400 text-sm">Decimals</span>
        <p class="text-2xl font-bold text-white">9</p>
        <p class="text-xs text-gray-500">Standard SPL precision</p>
      </div>
    </div>

    <!-- Token Utility -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Token Utility</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="card-hover">
          <h3 class="text-lg font-semibold text-white mb-3">Bridge Staking</h3>
          <p class="text-gray-400 text-sm mb-4">Bridge operators stake NJORD to participate in the network. Higher stakes unlock higher volume limits and better routing.</p>
          <div class="space-y-2 text-xs text-gray-500">
            <div class="flex justify-between"><span>Bronze</span><span class="text-gray-300">10,000 NJORD</span></div>
            <div class="flex justify-between"><span>Silver</span><span class="text-gray-300">50,000 NJORD</span></div>
            <div class="flex justify-between"><span>Gold</span><span class="text-gray-300">200,000 NJORD</span></div>
            <div class="flex justify-between"><span>Platinum</span><span class="text-gray-300">500,000 NJORD</span></div>
          </div>
        </div>
        <div class="card-hover">
          <h3 class="text-lg font-semibold text-white mb-3">Governance</h3>
          <p class="text-gray-400 text-sm mb-4">NJORD holders vote on protocol parameters including fee rates, staking requirements, and slashing rules.</p>
          <div class="space-y-2 text-xs text-gray-500">
            <p>One token = one vote</p>
            <p>Platinum stakers can create proposals</p>
            <p>3-day voting period</p>
          </div>
        </div>
        <div class="card-hover">
          <h3 class="text-lg font-semibold text-white mb-3">Fee Discounts</h3>
          <p class="text-gray-400 text-sm mb-4">Companies stake NJORD for reduced campaign fees. More stake = bigger discounts.</p>
          <div class="space-y-2 text-xs text-gray-500">
            <div class="flex justify-between"><span>5,000 NJORD</span><span class="text-gray-300">10% off</span></div>
            <div class="flex justify-between"><span>25,000 NJORD</span><span class="text-gray-300">25% off</span></div>
            <div class="flex justify-between"><span>100,000 NJORD</span><span class="text-gray-300">50% off</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Distribution -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Token Distribution</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="d in distribution" :key="d.name" class="card">
          <div class="flex justify-between items-center mb-2">
            <h4 class="text-white font-medium">{{ d.name }}</h4>
            <span class="text-njord-400 font-bold">{{ d.pct }}%</span>
          </div>
          <div class="h-2 bg-surface-700 rounded-full overflow-hidden mb-2">
            <div class="h-full bg-gradient-to-r from-njord-500 to-njord-400 rounded-full" :style="{ width: `${d.pct * 2.85}%` }" />
          </div>
          <p class="text-gray-500 text-xs">{{ d.amount }} NJORD</p>
          <p class="text-gray-600 text-xs">{{ d.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Fee Distribution -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Protocol Fee Flow</h2>
      <div class="card max-w-2xl mx-auto">
        <p class="text-gray-400 text-sm mb-6 text-center">2% protocol fee collected on all commissions</p>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-20 text-right text-njord-400 font-bold">50%</div>
            <div class="flex-1 h-3 bg-surface-700 rounded-full overflow-hidden">
              <div class="h-full bg-njord-500 rounded-full" style="width: 50%" />
            </div>
            <div class="w-40">
              <p class="text-white text-sm">Treasury</p>
              <p class="text-gray-500 text-xs">Development & grants</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-20 text-right text-blue-400 font-bold">30%</div>
            <div class="flex-1 h-3 bg-surface-700 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: 30%" />
            </div>
            <div class="w-40">
              <p class="text-white text-sm">Staking Rewards</p>
              <p class="text-gray-500 text-xs">Operator incentives</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-20 text-right text-amber-400 font-bold">20%</div>
            <div class="flex-1 h-3 bg-surface-700 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full" style="width: 20%" />
            </div>
            <div class="w-40">
              <p class="text-white text-sm">Buyback & Burn</p>
              <p class="text-gray-500 text-xs">Deflationary pressure</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inflation Schedule -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Inflation Schedule</h2>
      <div class="card max-w-2xl mx-auto overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-gray-400 text-left">
              <th class="pb-3">Year</th>
              <th class="pb-3">Inflation</th>
              <th class="pb-3">Emission</th>
            </tr>
          </thead>
          <tbody class="text-gray-300">
            <tr v-for="row in inflationSchedule" :key="row.year" class="border-t border-surface-700">
              <td class="py-3 text-white font-medium">{{ row.year }}</td>
              <td class="py-3">{{ row.rate }}</td>
              <td class="py-3">{{ row.emission }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const distribution = [
  { name: 'Ecosystem & Community', pct: 35, amount: '350,000,000', desc: 'Bridge rewards, affiliate incentives, grants' },
  { name: 'Team & Advisors', pct: 20, amount: '200,000,000', desc: '4-year vesting, 1-year cliff' },
  { name: 'Treasury', pct: 15, amount: '150,000,000', desc: 'Development, reserves, strategic' },
  { name: 'Private Sale', pct: 12, amount: '120,000,000', desc: '2-year vesting, 6-month cliff' },
  { name: 'Public Sale', pct: 8, amount: '80,000,000', desc: 'No lock-up, initial liquidity' },
  { name: 'Liquidity & Partners', pct: 10, amount: '100,000,000', desc: 'DEX pools, integrations' },
]

const inflationSchedule = [
  { year: 'Year 1', rate: '5%', emission: '50,000,000 NJORD' },
  { year: 'Year 2', rate: '4%', emission: '40,000,000 NJORD' },
  { year: 'Year 3', rate: '3%', emission: '30,000,000 NJORD' },
  { year: 'Year 4', rate: '2%', emission: '20,000,000 NJORD' },
  { year: 'Year 5+', rate: '1%', emission: '10,000,000 NJORD' },
]
</script>
