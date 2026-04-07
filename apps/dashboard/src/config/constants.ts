export const NJORD_DECIMALS = 9
export const USDC_DECIMALS = 6
export const BASIS_POINTS = 10000

export const AFFILIATE_TIERS = [
  { name: 'New', key: 'NEW', stake: 0, holdDays: 7, access: 'Open campaigns only', color: 'gray' },
  { name: 'Verified', key: 'VERIFIED', stake: 100, holdDays: 3, access: 'Standard campaigns', color: 'blue' },
  { name: 'Trusted', key: 'TRUSTED', stake: 1000, holdDays: 1, access: 'Premium campaigns', color: 'purple' },
  { name: 'Elite', key: 'ELITE', stake: 10000, holdDays: 0, access: 'All campaigns, real-time settlement', color: 'amber' },
] as const

export const BRIDGE_TIERS = [
  { name: 'Bronze', key: 'BRONZE', stake: 10000, dailyMax: '$10K', color: 'amber' },
  { name: 'Silver', key: 'SILVER', stake: 50000, dailyMax: '$100K', color: 'gray' },
  { name: 'Gold', key: 'GOLD', stake: 200000, dailyMax: '$1M', color: 'yellow' },
  { name: 'Platinum', key: 'PLATINUM', stake: 500000, dailyMax: 'Unlimited', color: 'purple' },
] as const

export const PROTOCOL_FEE_BPS = 250 // 2.5%

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'How It Works', path: '/how-it-works' },
  { name: 'Network Stats', path: '/stats' },
  { name: 'Campaigns', path: '/campaigns' },
  { name: 'Getting Started', path: '/getting-started' },
] as const

export const LEARN_LINKS = [
  { name: 'For Affiliates', path: '/affiliates' },
  { name: 'For Companies', path: '/companies' },
  { name: 'For Bridges', path: '/bridges' },
  { name: 'Tokenomics', path: '/tokenomics' },
  { name: 'Fraud Protection', path: '/fraud-protection' },
  { name: 'Roadmap', path: '/roadmap' },
] as const
