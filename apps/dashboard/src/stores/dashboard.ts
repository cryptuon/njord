import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ParticipantRole = 'affiliate' | 'company' | 'bridge' | 'unknown'

export interface DashboardProfile {
  role: ParticipantRole
  tier?: string
  totalEarnings?: string
  totalAttributions?: number
  fraudScore?: number
  stakeAmount?: string
  totalVolume?: string
  totalCampaigns?: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const profile = ref<DashboardProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const role = ref<ParticipantRole>('unknown')

  const isAffiliate = computed(() => role.value === 'affiliate')
  const isCompany = computed(() => role.value === 'company')
  const isBridge = computed(() => role.value === 'bridge')

  function setProfile(data: DashboardProfile) {
    profile.value = data
    role.value = data.role
    error.value = null
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  function setError(msg: string) {
    error.value = msg
  }

  function reset() {
    profile.value = null
    role.value = 'unknown'
    error.value = null
  }

  return {
    profile,
    loading,
    error,
    role,
    isAffiliate,
    isCompany,
    isBridge,
    setProfile,
    setLoading,
    setError,
    reset,
  }
})
