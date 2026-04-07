<template>
  <nav class="glass sticky top-0 z-50 border-b border-surface-700/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-njord-400 to-njord-600 flex items-center justify-center">
            <span class="text-white font-bold text-sm">N</span>
          </div>
          <span class="text-white font-bold text-lg hidden sm:block">Njord</span>
        </router-link>

        <!-- Desktop Nav -->
        <div class="hidden lg:flex items-center gap-6">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="nav-link"
            active-class="nav-link-active"
          >
            {{ link.name }}
          </router-link>
          <div class="relative" ref="learnDropdownRef">
            <button
              @click="learnOpen = !learnOpen"
              class="nav-link flex items-center gap-1"
            >
              Learn
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': learnOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-show="learnOpen"
              class="absolute top-full mt-2 right-0 w-48 py-2 bg-surface-800 border border-surface-700 rounded-xl shadow-xl"
            >
              <router-link
                v-for="link in learnLinks"
                :key="link.path"
                :to="link.path"
                class="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-surface-700 transition-colors"
                @click="learnOpen = false"
              >
                {{ link.name }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-3">
          <NetworkSwitcher />
          <WalletButton />
          <!-- Mobile Menu Toggle -->
          <button @click="ui.toggleMobileNav()" class="lg:hidden p-2 text-gray-400 hover:text-white">
            <svg v-if="!ui.mobileNavOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Nav -->
    <div v-show="ui.mobileNavOpen" class="lg:hidden border-t border-surface-700">
      <div class="px-4 py-4 space-y-2">
        <router-link
          v-for="link in [...navLinks, ...learnLinks]"
          :key="link.path"
          :to="link.path"
          class="block px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-colors"
          @click="ui.closeMobileNav()"
        >
          {{ link.name }}
        </router-link>
        <router-link
          to="/dashboard"
          class="block px-3 py-2 rounded-lg text-njord-400 hover:bg-surface-700 transition-colors font-medium"
          @click="ui.closeMobileNav()"
        >
          My Dashboard
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NAV_LINKS, LEARN_LINKS } from '@/config/constants'
import { useUiStore } from '@/stores/ui'
import NetworkSwitcher from './NetworkSwitcher.vue'
import WalletButton from './WalletButton.vue'

const ui = useUiStore()
const navLinks = NAV_LINKS
const learnLinks = LEARN_LINKS
const learnOpen = ref(false)
const learnDropdownRef = ref<HTMLElement | null>(null)

function handleClickOutside(e: MouseEvent) {
  if (learnDropdownRef.value && !learnDropdownRef.value.contains(e.target as Node)) {
    learnOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
