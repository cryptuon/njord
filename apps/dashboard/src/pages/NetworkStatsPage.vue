<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-12">
      <h1 class="section-title mb-4">Network Stats</h1>
      <p class="section-subtitle mx-auto">
        Live statistics from the Njord protocol on {{ network.config.name }}
      </p>
    </div>

    <!-- Global Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      <StatCard label="Total Campaigns" :value="formatCompact(stats.globalStats.totalCampaigns)" :subtitle="`${stats.globalStats.activeCampaigns} active`" />
      <StatCard label="Total Volume" :value="formatUsd(stats.globalStats.totalVolume, true)" />
      <StatCard label="Total Affiliates" :value="formatCompact(stats.globalStats.totalAffiliates)" />
      <StatCard label="Total Bridges" :value="formatCompact(stats.globalStats.totalBridges)" />
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      <StatCard label="Total Attributions" :value="formatCompact(stats.globalStats.totalAttributions)" />
      <StatCard label="Total Commissions" :value="formatUsd(stats.globalStats.totalCommissions, true)" />
      <StatCard label="Total Challenges" :value="formatCompact(stats.globalStats.totalChallenges)" />
      <StatCard label="Challenge Success Rate" :value="`${(stats.globalStats.challengeSuccessRate * 100).toFixed(0)}%`" />
    </div>

    <!-- Charts Placeholder -->
    <div class="grid md:grid-cols-2 gap-6 mb-12">
      <div class="card">
        <h3 class="text-lg font-semibold text-white mb-4">Volume (30 Days)</h3>
        <div class="h-64 flex items-center justify-center text-gray-500">
          <p class="text-sm">Connect to an indexer to view historical data</p>
        </div>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold text-white mb-4">Attributions (30 Days)</h3>
        <div class="h-64 flex items-center justify-center text-gray-500">
          <p class="text-sm">Connect to an indexer to view historical data</p>
        </div>
      </div>
    </div>

    <!-- Protocol Info -->
    <div class="card">
      <h3 class="text-lg font-semibold text-white mb-4">Protocol Information</h3>
      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <div class="flex justify-between py-2 border-b border-surface-700">
          <span class="text-gray-400">Network</span>
          <span class="text-white">{{ network.config.name }}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-surface-700">
          <span class="text-gray-400">Protocol Fee</span>
          <span class="text-white">2.5%</span>
        </div>
        <div class="flex justify-between py-2 border-b border-surface-700">
          <span class="text-gray-400">Program ID</span>
          <AddressDisplay :address="network.config.programId" :chars="6" />
        </div>
        <div class="flex justify-between py-2 border-b border-surface-700">
          <span class="text-gray-400">Blockchain</span>
          <span class="text-white">Solana</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStatsStore } from '@/stores/stats'
import { useNetworkStore } from '@/stores/network'
import { useFormatters } from '@/composables/useFormatters'
import StatCard from '@/components/common/StatCard.vue'
import AddressDisplay from '@/components/common/AddressDisplay.vue'

const stats = useStatsStore()
const network = useNetworkStore()
const { formatCompact, formatUsd } = useFormatters()
</script>
