import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GlobalStatsData } from '@/graphql/queries/globalStats'
import type { DailyStatNode } from '@/graphql/queries/dailyStats'

export interface GlobalStats {
  totalCampaigns: number
  activeCampaigns: number
  totalAffiliates: number
  totalBridges: number
  totalAttributions: number
  totalVolume: string
  totalCommissions: string
  totalChallenges: number
  challengeSuccessRate: number
}

const defaultStats: GlobalStats = {
  totalCampaigns: 0,
  activeCampaigns: 0,
  totalAffiliates: 0,
  totalBridges: 0,
  totalAttributions: 0,
  totalVolume: '0',
  totalCommissions: '0',
  totalChallenges: 0,
  challengeSuccessRate: 0,
}

export const useStatsStore = defineStore('stats', () => {
  const globalStats = ref<GlobalStats>({ ...defaultStats })
  const dailyStats = ref<DailyStatNode[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setGlobalStats(data: GlobalStatsData['globalStats']) {
    globalStats.value = data
    error.value = null
  }

  function setDailyStats(data: DailyStatNode[]) {
    dailyStats.value = data
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  function setError(msg: string | null) {
    error.value = msg
  }

  function reset() {
    globalStats.value = { ...defaultStats }
    dailyStats.value = []
    error.value = null
  }

  return {
    globalStats,
    dailyStats,
    loading,
    error,
    setGlobalStats,
    setDailyStats,
    setLoading,
    setError,
    reset,
  }
})
