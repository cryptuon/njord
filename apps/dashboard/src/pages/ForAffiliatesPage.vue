<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <!-- Hero -->
    <div class="text-center mb-16">
      <h1 class="section-title mb-4">Earn Commissions by Promoting Products You Believe In</h1>
      <p class="section-subtitle mx-auto">
        Join campaigns, share your unique links, and earn instant commissions settled on Solana.
        Build your reputation to unlock higher tiers and faster payouts.
      </p>
    </div>

    <!-- What Affiliates Do -->
    <div class="grid md:grid-cols-3 gap-6 mb-20">
      <div class="card-hover text-center">
        <div class="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4 text-xl">1</div>
        <h3 class="text-lg font-semibold text-white mb-2">Browse Campaigns</h3>
        <p class="text-gray-400 text-sm">Explore active campaigns from companies. Filter by category, commission rate, and requirements.</p>
      </div>
      <div class="card-hover text-center">
        <div class="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4 text-xl">2</div>
        <h3 class="text-lg font-semibold text-white mb-2">Promote & Share</h3>
        <p class="text-gray-400 text-sm">Generate unique tracking links and share them through your blog, social media, videos, or newsletter.</p>
      </div>
      <div class="card-hover text-center">
        <div class="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4 text-xl">3</div>
        <h3 class="text-lg font-semibold text-white mb-2">Earn Instantly</h3>
        <p class="text-gray-400 text-sm">When a customer converts, your commission is calculated and paid automatically from escrow in seconds.</p>
      </div>
    </div>

    <!-- Tier System -->
    <div class="mb-20">
      <h2 class="section-title text-center mb-4">Affiliate Tier System</h2>
      <p class="section-subtitle mx-auto text-center mb-10">Build your reputation over time to unlock faster settlements and premium campaigns</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="tier in tiers" :key="tier.name" class="card-hover">
          <div class="flex items-center gap-2 mb-4">
            <span class="badge" :class="`badge-${tier.color}`">{{ tier.name }}</span>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Stake Required</span>
              <span class="text-white font-medium">{{ tier.stake === 0 ? 'None' : `${tier.stake.toLocaleString()} NJORD` }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Hold Period</span>
              <span class="text-white font-medium">{{ tier.holdDays === 0 ? 'Real-time' : `${tier.holdDays} day${tier.holdDays > 1 ? 's' : ''}` }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Access</span>
              <span class="text-white font-medium text-right text-xs">{{ tier.access }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Types of Affiliates -->
    <div class="mb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">Who Can Be an Affiliate?</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="type in affiliateTypes" :key="type.name" class="flex items-start gap-3 p-4 rounded-xl bg-surface-800/50 border border-surface-700">
          <span class="text-njord-400 mt-0.5">&#9679;</span>
          <div>
            <h4 class="text-white font-medium">{{ type.name }}</h4>
            <p class="text-gray-500 text-sm">{{ type.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="text-center">
      <router-link to="/campaigns" class="btn-primary mr-4">Browse Campaigns</router-link>
      <router-link to="/getting-started" class="btn-secondary">Getting Started Guide</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AFFILIATE_TIERS } from '@/config/constants'

const tiers = AFFILIATE_TIERS

const affiliateTypes = [
  { name: 'Content Creators', desc: 'YouTubers, bloggers, podcasters' },
  { name: 'Influencers', desc: 'Social media personalities' },
  { name: 'Comparison Sites', desc: 'Review and comparison platforms' },
  { name: 'Coupon/Deal Sites', desc: 'Discount aggregators' },
  { name: 'Email Marketers', desc: 'Newsletter operators' },
  { name: 'App Developers', desc: 'In-app promotions' },
]
</script>
