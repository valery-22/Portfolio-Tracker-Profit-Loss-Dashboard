// Core type definitions for the Portfolio Tracker application

export interface Asset {
  id: string
  coinId: string // CoinGecko ID (e.g., "bitcoin", "ethereum")
  symbol: string // Ticker symbol (e.g., "BTC", "ETH")
  name: string
  quantity: number
  buyPrice: number // Price per unit at time of purchase
  dateAdded: string
}

export interface PriceData {
  current: number
  change24h: number
  changePercent24h: number
  sparkline7d?: number[]
  lastUpdated: string
}

export interface AssetWithPrice extends Asset {
  currentPrice: number
  currentValue: number
  costBasis: number
  profitLoss: number
  profitLossPercent: number
  change24h: number
  changePercent24h: number
}

export interface PortfolioSummary {
  totalValue: number
  totalCostBasis: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  total24hChange: number
  total24hChangePercent: number
  bestPerformer: AssetWithPrice | null
  worstPerformer: AssetWithPrice | null
}

export interface RefreshSettings {
  autoRefresh: boolean
  intervalSeconds: number
}

export type RefreshInterval = 30 | 60 | 120 | 300
