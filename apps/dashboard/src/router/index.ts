import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', name: 'home', component: () => import('@/pages/HomePage.vue') },
        { path: 'how-it-works', name: 'how-it-works', component: () => import('@/pages/HowItWorksPage.vue') },
        { path: 'stats', name: 'stats', component: () => import('@/pages/NetworkStatsPage.vue') },
        { path: 'campaigns', name: 'campaigns', component: () => import('@/pages/CampaignsPage.vue') },
        { path: 'campaigns/:id', name: 'campaign-detail', component: () => import('@/pages/CampaignDetailPage.vue') },
        { path: 'affiliates', name: 'affiliates', component: () => import('@/pages/ForAffiliatesPage.vue') },
        { path: 'companies', name: 'companies', component: () => import('@/pages/ForCompaniesPage.vue') },
        { path: 'bridges', name: 'bridges', component: () => import('@/pages/ForBridgesPage.vue') },
        { path: 'tokenomics', name: 'tokenomics', component: () => import('@/pages/TokenomicsPage.vue') },
        { path: 'getting-started', name: 'getting-started', component: () => import('@/pages/GettingStartedPage.vue') },
        { path: 'fraud-protection', name: 'fraud-protection', component: () => import('@/pages/FraudProtectionPage.vue') },
        { path: 'roadmap', name: 'roadmap', component: () => import('@/pages/RoadmapPage.vue') },
      ],
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      children: [
        { path: '', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
})

export { router }
