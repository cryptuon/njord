<template>
  <div>
    <!-- Not Connected -->
    <div v-if="!wallet.connected" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="w-20 h-20 rounded-2xl bg-njord-600/20 flex items-center justify-center mb-6">
        <svg class="w-10 h-10 text-njord-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
      <p class="text-gray-400 mb-8 max-w-md">
        Connect a Solana wallet to view your personal dashboard, track earnings, manage campaigns, and monitor your participation in the Njord network.
      </p>
      <div class="space-y-3 text-sm text-gray-500 mb-8">
        <p>Supported wallets: Phantom, Solflare, Backpack</p>
      </div>
      <div class="flex gap-4">
        <router-link to="/getting-started" class="btn-secondary">Setup Guide</router-link>
      </div>
    </div>

    <!-- Connected Dashboard -->
    <div v-else>
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <div class="flex items-center gap-2 text-gray-400">
          <AddressDisplay :address="wallet.publicKey!" :chars="6" />
          <span class="text-gray-600">on {{ network.config.name }}</span>
        </div>
      </div>

      <!-- Role Detection Notice -->
      <div v-if="dashboard.role === 'unknown'" class="card bg-gradient-to-r from-njord-950 to-surface-800 mb-8">
        <h3 class="text-lg font-semibold text-white mb-2">New to Njord?</h3>
        <p class="text-gray-400 text-sm mb-4">
          We didn't find an existing profile for this wallet. Choose your role to get started:
        </p>
        <div class="flex flex-wrap gap-3">
          <router-link to="/affiliates" class="btn-secondary text-sm">Become an Affiliate</router-link>
          <router-link to="/companies" class="btn-secondary text-sm">Create a Campaign</router-link>
          <router-link to="/bridges" class="btn-secondary text-sm">Run a Bridge</router-link>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Earnings" :value="formatUsd(dashboard.profile?.totalEarnings || '0')" />
        <StatCard label="Campaigns" :value="String(dashboard.profile?.totalCampaigns || 0)" />
        <StatCard label="Attributions" :value="String(dashboard.profile?.totalAttributions || 0)" />
        <StatCard label="Tier" :value="dashboard.profile?.tier || 'New'" />
      </div>

      <!-- Activity -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-white mb-4">My Campaigns</h3>
          <EmptyState title="No campaigns" message="Join campaigns from the Campaigns page to start earning commissions." />
        </div>
        <div class="card">
          <h3 class="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <EmptyState title="No activity yet" message="Your conversions and earnings will appear here once you start participating." />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'
import { useNetworkStore } from '@/stores/network'
import { useDashboardStore } from '@/stores/dashboard'
import { useFormatters } from '@/composables/useFormatters'
import StatCard from '@/components/common/StatCard.vue'
import AddressDisplay from '@/components/common/AddressDisplay.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const wallet = useWalletStore()
const network = useNetworkStore()
const dashboard = useDashboardStore()
const { formatUsd } = useFormatters()
</script>
