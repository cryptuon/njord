<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-njord-950/30 to-surface-900" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-extrabold mb-6">
            <span class="text-white">Decentralized</span>
            <br />
            <span class="gradient-text">Affiliate Marketing</span>
            <br />
            <span class="text-white">on Solana</span>
          </h1>
          <p class="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Transparent, instant, and trustless commissions. Create campaigns, promote products,
            and earn rewards &mdash; all settled on-chain in seconds.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <router-link to="/campaigns" class="btn-primary text-lg">
              Explore Campaigns
            </router-link>
            <router-link to="/getting-started" class="btn-secondary text-lg">
              Get Started
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="border-y border-surface-700 bg-surface-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <p class="text-2xl md:text-3xl font-bold text-white">{{ formatCompact(stats.globalStats.totalCampaigns) }}</p>
            <p class="text-sm text-gray-400 mt-1">Total Campaigns</p>
          </div>
          <div class="text-center">
            <p class="text-2xl md:text-3xl font-bold text-white">{{ formatUsd(stats.globalStats.totalVolume, true) }}</p>
            <p class="text-sm text-gray-400 mt-1">Total Volume</p>
          </div>
          <div class="text-center">
            <p class="text-2xl md:text-3xl font-bold text-white">{{ formatCompact(stats.globalStats.totalAffiliates) }}</p>
            <p class="text-sm text-gray-400 mt-1">Active Affiliates</p>
          </div>
          <div class="text-center">
            <p class="text-2xl md:text-3xl font-bold text-white">{{ formatCompact(stats.globalStats.totalBridges) }}</p>
            <p class="text-sm text-gray-400 mt-1">Bridge Operators</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Preview -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <h2 class="section-title mb-4">How It Works</h2>
        <p class="section-subtitle mx-auto">Three simple steps to transparent, on-chain affiliate marketing</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div v-for="(step, i) in steps" :key="i" class="card-hover text-center">
          <div class="w-14 h-14 rounded-2xl bg-njord-600/20 text-njord-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            {{ i + 1 }}
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">{{ step.title }}</h3>
          <p class="text-gray-400">{{ step.description }}</p>
        </div>
      </div>
      <div class="text-center mt-10">
        <router-link to="/how-it-works" class="btn-secondary">
          Learn More
        </router-link>
      </div>
    </section>

    <!-- Roles Overview -->
    <section class="bg-surface-800/30 border-y border-surface-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center mb-16">
          <h2 class="section-title mb-4">Choose Your Role</h2>
          <p class="section-subtitle mx-auto">Everyone has a part to play in the Njord ecosystem</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <router-link to="/affiliates" class="card-hover group">
            <div class="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2 group-hover:text-njord-400 transition-colors">Affiliates</h3>
            <p class="text-gray-400 text-sm">Promote products you believe in and earn instant commissions. Build your reputation and unlock higher tiers.</p>
          </router-link>
          <router-link to="/companies" class="card-hover group">
            <div class="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2 group-hover:text-njord-400 transition-colors">Companies</h3>
            <p class="text-gray-400 text-sm">Launch transparent, results-driven campaigns. Only pay for verified conversions with built-in fraud protection.</p>
          </router-link>
          <router-link to="/bridges" class="card-hover group">
            <div class="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2 group-hover:text-njord-400 transition-colors">Bridge Operators</h3>
            <p class="text-gray-400 text-sm">Power the fiat infrastructure. Process payments, earn fees, and stake NJORD tokens for higher tiers.</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="card bg-gradient-to-r from-njord-950 to-surface-800 text-center py-16">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p class="text-gray-400 mb-8 max-w-lg mx-auto">
          Connect your wallet to explore campaigns, track earnings, and manage your participation in the Njord network.
        </p>
        <router-link to="/dashboard" class="btn-primary text-lg">
          Launch Dashboard
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useStatsStore } from '@/stores/stats'
import { useFormatters } from '@/composables/useFormatters'

const stats = useStatsStore()
const { formatCompact, formatUsd } = useFormatters()

const steps = [
  {
    title: 'Create a Campaign',
    description: 'Companies set up campaigns with budgets, commission rates, and targeting. Funds are locked in a secure on-chain escrow.',
  },
  {
    title: 'Promote & Convert',
    description: 'Affiliates browse campaigns, generate unique links, and promote products to their audience. Every conversion is tracked on Solana.',
  },
  {
    title: 'Earn Instantly',
    description: 'Commissions are calculated and paid automatically from escrow. Settlement in ~3 seconds with full transparency.',
  },
]
</script>
