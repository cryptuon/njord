export function useFormatters() {
  function formatNumber(value: number | string, decimals = 0): string {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0'
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  function formatCompact(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0'
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
    return num.toFixed(num < 10 ? 1 : 0)
  }

  function formatUsd(value: number | string, compact = false): string {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (compact) return `$${formatCompact(num)}`
    return `$${formatNumber(num, 2)}`
  }

  function formatTokens(lamports: number | string, decimals: number = 9): string {
    const num = typeof lamports === 'string' ? parseFloat(lamports) : lamports
    const tokens = num / Math.pow(10, decimals)
    return formatNumber(tokens, 2)
  }

  function formatAddress(address: string, chars = 4): string {
    if (!address || address.length < chars * 2 + 3) return address
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
  }

  function formatDate(timestamp: string | number): string {
    const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function formatRelativeTime(timestamp: string | number): string {
    const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return formatDate(timestamp)
  }

  function formatPercent(bps: number): string {
    return `${(bps / 100).toFixed(1)}%`
  }

  function formatHoldPeriod(seconds: number): string {
    if (seconds === 0) return 'Real-time'
    const days = seconds / 86400
    if (days >= 1) return `${days} day${days > 1 ? 's' : ''}`
    const hours = seconds / 3600
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  return {
    formatNumber,
    formatCompact,
    formatUsd,
    formatTokens,
    formatAddress,
    formatDate,
    formatRelativeTime,
    formatPercent,
    formatHoldPeriod,
  }
}
