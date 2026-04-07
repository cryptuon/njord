<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
      <div>
        <h1 class="section-title">Campaigns</h1>
        <p class="text-gray-400 mt-2">Browse active affiliate campaigns on {{ network.config.name }}</p>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="filterStatus"
          class="input !w-auto !py-2 text-sm"
        >
          <option value="all">All Campaigns</option>
          <option value="active">Active Only</option>
          <option value="paused">Paused</option>
        </select>
      </div>
    </div>

    <!-- Campaign Grid -->
    <div v-if="campaigns.campaigns.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <router-link
        v-for="campaign in campaigns.campaigns"
        :key="campaign.id"
        :to="`/campaigns/${campaign.pubkey}`"
        class="card-hover group"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-white font-semibold group-hover:text-njord-400 transition-colors truncate">
            {{ campaign.name || `Campaign #${campaign.id}` }}
          </h3>
          <Badge
            :label="campaign.isActive ? (campaign.isPaused ? 'Paused' : 'Active') : 'Ended'"
            :variant="campaign.isActive ? (campaign.isPaused ? 'amber' : 'green') : 'gray'"
          />
        </div>

        <div class="space-y-2 text-sm mb-4">
          <div class="flex justify-between">
            <span class="text-gray-400">Commission</span>
            <span class="text-white">{{ campaign.commissionType === 'PERCENTAGE' ? `${campaign.commissionValue}%` : `$${campaign.commissionValue}` }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Min Tier</span>
            <span class="badge text-xs" :class="tierBadge(campaign.minAffiliateTier)">{{ campaign.minAffiliateTier }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Hold Period</span>
            <span class="text-white">{{ formatHoldPeriod(campaign.holdPeriod) }}</span>
          </div>
        </div>

        <ProgressBar
          :percentage="budgetPercent(campaign)"
          label="Budget Used"
          :show-label="true"
          :color="budgetPercent(campaign) > 90 ? 'red' : 'njord'"
        />

        <div class="flex justify-between mt-3 text-xs text-gray-500">
          <span>{{ campaign.stats.uniqueAffiliates }} affiliates</span>
          <span>{{ campaign.stats.totalAttributions }} conversions</span>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      title="No campaigns found"
      message="There are no campaigns matching your filters. Try adjusting your criteria or check back later."
    />

    <!-- Pagination -->
    <div v-if="campaigns.totalCount > campaigns.limit" class="flex items-center justify-center gap-4 mt-8">
      <button
        @click="campaigns.prevPage()"
        :disabled="!campaigns.hasPreviousPage"
        class="btn-secondary !px-4 !py-2 text-sm"
      >
        Previous
      </button>
      <span class="text-gray-400 text-sm">
        Page {{ campaigns.currentPage }} of {{ Math.ceil(campaigns.totalCount / campaigns.limit) }}
      </span>
      <button
        @click="campaigns.nextPage()"
        :disabled="!campaigns.hasNextPage"
        class="btn-secondary !px-4 !py-2 text-sm"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCampaignsStore } from '@/stores/campaigns'
import { useNetworkStore } from '@/stores/network'
import { useFormatters } from '@/composables/useFormatters'
import Badge from '@/components/common/Badge.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const campaigns = useCampaignsStore()
const network = useNetworkStore()
const { formatHoldPeriod } = useFormatters()
const filterStatus = ref('active')

function budgetPercent(campaign: { budget: string; spent: string }): number {
  const budget = parseFloat(campaign.budget)
  const spent = parseFloat(campaign.spent)
  return budget > 0 ? (spent / budget) * 100 : 0
}

function tierBadge(tier: string): string {
  const map: Record<string, string> = {
    NEW: 'badge-new',
    VERIFIED: 'badge-verified',
    TRUSTED: 'badge-trusted',
    ELITE: 'badge-elite',
  }
  return map[tier] || 'badge-new'
}
</script>
