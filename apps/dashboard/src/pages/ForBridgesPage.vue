<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <h1 class="section-title mb-4">Power the Future of Affiliate Marketing</h1>
      <p class="section-subtitle mx-auto">
        Bridge operators are the backbone of mainstream adoption. Run payment infrastructure,
        earn fees, and stake NJORD tokens for higher tiers.
      </p>
    </div>

    <!-- What Bridges Do -->
    <div class="card mb-16">
      <h2 class="text-xl font-bold text-white mb-6">What Bridge Operators Do</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="flex gap-3">
            <span class="text-njord-400 mt-1">&#9679;</span>
            <div>
              <p class="text-white font-medium">Accept Fiat Payments</p>
              <p class="text-gray-500 text-sm">Process credit cards, bank transfers, UPI, and other local payment methods from customers</p>
            </div>
          </div>
          <div class="flex gap-3">
            <span class="text-njord-400 mt-1">&#9679;</span>
            <div>
              <p class="text-white font-medium">Submit Attributions On-Chain</p>
              <p class="text-gray-500 text-sm">Convert fiat transactions to on-chain attribution events on Solana</p>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex gap-3">
            <span class="text-njord-400 mt-1">&#9679;</span>
            <div>
              <p class="text-white font-medium">Facilitate Withdrawals</p>
              <p class="text-gray-500 text-sm">Help affiliates convert crypto earnings back to local currency</p>
            </div>
          </div>
          <div class="flex gap-3">
            <span class="text-njord-400 mt-1">&#9679;</span>
            <div>
              <p class="text-white font-medium">Detect Fraud</p>
              <p class="text-gray-500 text-sm">Run detection infrastructure to prevent fraudulent attributions from reaching the chain</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bridge Tiers -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Bridge Operator Tiers</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="tier in bridgeTiers" :key="tier.name" class="card-hover">
          <span class="badge mb-4" :class="`badge-${tier.color}`">{{ tier.name }}</span>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Min Stake</span>
              <span class="text-white font-medium">{{ tier.stake.toLocaleString() }} NJORD</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Daily Volume</span>
              <span class="text-white font-medium">{{ tier.dailyMax }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue Streams -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Revenue Streams</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="card-hover">
          <h3 class="text-white font-semibold mb-2">Attribution Fees</h3>
          <p class="text-gray-400 text-sm">1% of commissions processed through your bridge. Higher volume = higher revenue.</p>
          <p class="text-njord-400 text-xs mt-2">Example: $1M monthly volume = $10,000 revenue</p>
        </div>
        <div class="card-hover">
          <h3 class="text-white font-semibold mb-2">Staking Rewards</h3>
          <p class="text-gray-400 text-sm">Pro-rata share of protocol inflation rewards based on your stake amount.</p>
          <p class="text-njord-400 text-xs mt-2">Rewards distributed from 30% of protocol fees</p>
        </div>
        <div class="card-hover">
          <h3 class="text-white font-semibold mb-2">Conversion Spread</h3>
          <p class="text-gray-400 text-sm">Set your own fiat-to-crypto conversion rate. Typically 0.5-2%.</p>
          <p class="text-njord-400 text-xs mt-2">Example: $100 converted = $0.50-$2.00 revenue</p>
        </div>
        <div class="card-hover">
          <h3 class="text-white font-semibold mb-2">Withdrawal Fees</h3>
          <p class="text-gray-400 text-sm">Charge per-withdrawal or percentage fees when affiliates cash out to fiat.</p>
          <p class="text-njord-400 text-xs mt-2">Example: $1 flat fee or 0.5% per withdrawal</p>
        </div>
      </div>
    </div>

    <!-- Setup Steps -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-white text-center mb-10">How to Set Up a Bridge</h2>
      <div class="max-w-2xl mx-auto space-y-4">
        <div v-for="(step, i) in setupSteps" :key="i" class="flex gap-4 items-start">
          <div class="w-8 h-8 rounded-full bg-njord-600/20 text-njord-400 flex items-center justify-center shrink-0 text-sm font-bold">
            {{ i + 1 }}
          </div>
          <div class="card flex-1">
            <h4 class="text-white font-medium">{{ step.title }}</h4>
            <p class="text-gray-400 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center">
      <router-link to="/getting-started" class="btn-primary">Setup Guide</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BRIDGE_TIERS } from '@/config/constants'

const bridgeTiers = BRIDGE_TIERS

const setupSteps = [
  { title: 'Stake NJORD Tokens', desc: 'Acquire and stake minimum 10,000 NJORD tokens to register as a bridge operator.' },
  { title: 'Set Up Infrastructure', desc: 'Deploy the bridge SDK on your server. Docker images are available for easy deployment.' },
  { title: 'Integrate Payment Provider', desc: 'Connect Stripe, Razorpay, or other payment providers supported in your region.' },
  { title: 'Configure & Register', desc: 'Set your fees, region, and supported payment methods. Register with the protocol on-chain.' },
  { title: 'Start Processing', desc: 'Begin processing payments and earning fees. Monitor your dashboard for volume and reputation.' },
]
</script>
