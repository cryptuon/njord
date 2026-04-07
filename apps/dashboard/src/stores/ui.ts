import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const mobileNavOpen = ref(false)
  const mobileDropdownOpen = ref(false)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleMobileNav() {
    mobileNavOpen.value = !mobileNavOpen.value
    if (mobileNavOpen.value) mobileDropdownOpen.value = false
  }

  function closeMobileNav() {
    mobileNavOpen.value = false
  }

  return {
    sidebarOpen,
    mobileNavOpen,
    mobileDropdownOpen,
    toggleSidebar,
    toggleMobileNav,
    closeMobileNav,
  }
})
