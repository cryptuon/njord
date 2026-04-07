<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <!-- Back Link -->
    <router-link to="/campaigns" class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Campaigns
    </router-link>

    <!-- Campaign Header -->
    <div class="card mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white mb-2">Campaign #{{ $route.params.id }}</h1>
          <p class="text-gray-400 text-sm">View campaign details, performance metrics, and affiliate activity</p>
        </div>
        <Badge label="Active" variant="green" />
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard label="Total Volume" value="$0.00" />
      <StatCard label="Commissions Paid" value="$0.00" />
      <StatCard label="Affiliates" value="0" />
      <StatCard label="Conversions" value="0" />
    </div>

    <!-- Campaign Details -->
    <div class="grid md:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-white mb-4">Campaign Parameters</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-surface-700">
            <span class="text-gray-400">Commission Type</span>
            <span class="text-white">--</span>
          </div>
          <div class="flex justify-between py-2 border-b border-surface-700">
            <span class="text-gray-400">Commission Rate</span>
            <span class="text-white">--</span>
          </div>
          <div class="flex justify-between py-2 border-b border-surface-700">
            <span class="text-gray-400">Min Affiliate Tier</span>
            <span class="text-white">--</span>
          </div>
          <div class="flex justify-between py-2 border-b border-surface-700">
            <span class="text-gray-400">Hold Period</span>
            <span class="text-white">--</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-400">Budget Remaining</span>
            <span class="text-white">--</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <EmptyState title="No activity yet" message="Conversions will appear here once the campaign is active and generating attributions." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatCard from '@/components/common/StatCard.vue'
import Badge from '@/components/common/Badge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
</script>
