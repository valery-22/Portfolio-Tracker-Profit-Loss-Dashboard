// Portfolio calculation utilities

import type { Asset, AssetWithPrice, PortfolioSummary, PriceData } from "@/types/portfolio"

/**
 * Calculates derived values for a single asset
 */
export function calculateAssetMetrics(asset: Asset, priceData: PriceData | null): AssetWithPrice {
  const currentPrice = priceData?.current ?? 0
  const currentValue = asset.quantity * currentPrice
  const costBasis = asset.quantity * asset.buyPrice
  const profitLoss = currentValue - costBasis
  const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0

  // Calculate 24h change for this holding
  const change24h = priceData ? (currentValue * priceData.changePercent24h) / 100 : 0

  return {
    ...asset,
    currentPrice,
    currentValue,
    costBasis,
    profitLoss,
    profitLossPercent,
    change24h,
    changePercent24h: priceData?.changePercent24h ?? 0,
  }
}

/**
 * Calculates overall portfolio summary
 */
export function calculatePortfolioSummary(assetsWithPrices: AssetWithPrice[]): PortfolioSummary {
  if (assetsWithPrices.length === 0) {
    return {
      totalValue: 0,
      totalCostBasis: 0,
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      total24hChange: 0,
      total24hChangePercent: 0,
      bestPerformer: null,
      worstPerformer: null,
    }
  }

  const totalValue = assetsWithPrices.reduce((sum, a) => sum + a.currentValue, 0)
  const totalCostBasis = assetsWithPrices.reduce((sum, a) => sum + a.costBasis, 0)
  const totalProfitLoss = totalValue - totalCostBasis
  const totalProfitLossPercent = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0

  const total24hChange = assetsWithPrices.reduce((sum, a) => sum + a.change24h, 0)
  const total24hChangePercent = totalValue > 0 ? (total24hChange / (totalValue - total24hChange)) * 100 : 0

  // Find best and worst performers by profit/loss percentage
  const sortedByPerformance = [...assetsWithPrices].sort((a, b) => b.profitLossPercent - a.profitLossPercent)

  return {
    totalValue,
    totalCostBasis,
    totalProfitLoss,
    totalProfitLossPercent,
    total24hChange,
    total24hChangePercent,
    bestPerformer: sortedByPerformance[0] ?? null,
    worstPerformer: sortedByPerformance[sortedByPerformance.length - 1] ?? null,
  }
}

/**
 * Formats a number as currency
 */
export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formats a number as percentage
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Formats large numbers in a compact way
 */
export function formatCompact(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return formatCurrency(value)
}
