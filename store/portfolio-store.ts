// Zustand store for portfolio state management

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Asset, PriceData, RefreshInterval } from "@/types/portfolio"
import { fetchPrices } from "@/lib/api"

interface PortfolioState {
  // Data
  assets: Asset[]
  prices: Record<string, PriceData>

  // UI State
  isLoading: boolean
  error: string | null
  lastUpdated: string | null

  // Settings
  autoRefresh: boolean
  refreshInterval: RefreshInterval

  // Actions
  addAsset: (asset: Omit<Asset, "id" | "dateAdded">) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  removeAsset: (id: string) => void
  fetchAllPrices: () => Promise<void>
  setAutoRefresh: (enabled: boolean) => void
  setRefreshInterval: (interval: RefreshInterval) => void
  clearError: () => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      // Initial state
      assets: [],
      prices: {},
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefresh: true,
      refreshInterval: 60,

      // Add a new asset to the portfolio
      addAsset: (assetData) => {
        const newAsset: Asset = {
          ...assetData,
          id: crypto.randomUUID(),
          dateAdded: new Date().toISOString(),
        }

        set((state) => ({
          assets: [...state.assets, newAsset],
        }))

        // Immediately fetch price for the new asset
        get().fetchAllPrices()
      },

      // Update an existing asset
      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map((asset) => (asset.id === id ? { ...asset, ...updates } : asset)),
        }))
      },

      // Remove an asset from the portfolio
      removeAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== id),
        }))
      },

      // Fetch prices for all assets in portfolio
      fetchAllPrices: async () => {
        const { assets } = get()

        if (assets.length === 0) {
          set({ isLoading: false, error: null })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const coinIds = [...new Set(assets.map((a) => a.coinId))]
          const priceData = await fetchPrices(coinIds)

          // Transform API response to our price format
          const prices: Record<string, PriceData> = {}
          for (const coinId of coinIds) {
            if (priceData[coinId]) {
              prices[coinId] = {
                current: priceData[coinId].usd,
                change24h: 0, // Calculated from percent
                changePercent24h: priceData[coinId].usd_24h_change ?? 0,
                lastUpdated: new Date().toISOString(),
              }
            }
          }

          set({
            prices,
            isLoading: false,
            lastUpdated: new Date().toISOString(),
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to fetch prices",
          })
        }
      },

      // Toggle auto-refresh
      setAutoRefresh: (enabled) => {
        set({ autoRefresh: enabled })
      },

      // Set refresh interval
      setRefreshInterval: (interval) => {
        set({ refreshInterval: interval })
      },

      // Clear error state
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "portfolio-storage",
      // Only persist these fields to localStorage
      partialize: (state) => ({
        assets: state.assets,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
      }),
    },
  ),
)
