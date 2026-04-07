import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CampaignNode } from '@/graphql/queries/campaigns'

export const useCampaignsStore = defineStore('campaigns', () => {
  const campaigns = ref<CampaignNode[]>([])
  const totalCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const limit = ref(12)
  const offset = ref(0)
  const filterActive = ref<boolean | null>(true)

  const hasNextPage = computed(() => offset.value + limit.value < totalCount.value)
  const hasPreviousPage = computed(() => offset.value > 0)
  const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)

  function setCampaigns(data: CampaignNode[], total: number) {
    campaigns.value = data
    totalCount.value = total
    error.value = null
  }

  function nextPage() {
    if (hasNextPage.value) offset.value += limit.value
  }

  function prevPage() {
    if (hasPreviousPage.value) offset.value = Math.max(0, offset.value - limit.value)
  }

  function reset() {
    campaigns.value = []
    totalCount.value = 0
    offset.value = 0
    error.value = null
  }

  return {
    campaigns,
    totalCount,
    loading,
    error,
    limit,
    offset,
    filterActive,
    hasNextPage,
    hasPreviousPage,
    currentPage,
    setCampaigns,
    nextPage,
    prevPage,
    reset,
  }
})
