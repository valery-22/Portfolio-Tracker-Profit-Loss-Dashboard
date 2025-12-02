"use client"

import { DashboardHeader } from "@/components/header/dashboard-header"
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary"
import { AssetList } from "@/components/portfolio/asset-list"
import { AddAssetDialog } from "@/components/portfolio/add-asset-dialog"
import { AllocationPieChart } from "@/components/charts/allocation-pie-chart"
import { PerformanceSparklines } from "@/components/charts/performance-sparklines"
import { PortfolioValueChart } from "@/components/charts/portfolio-value-chart"
import { ErrorBanner } from "@/components/ui/error-banner"
import { usePortfolioStore } from "@/store/portfolio-store"

export default function DashboardPage() {
  const { assets, isLoading } = usePortfolioStore()
  const hasAssets = assets.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container px-4 py-6 space-y-6">
        {/* Error Banner */}
        <ErrorBanner />

        {/* Portfolio Summary Cards */}
        <section>
          <PortfolioSummary />
        </section>

        {/* Charts Section - Only show when there are assets */}
        {hasAssets && (
          <section className="grid gap-4 md:grid-cols-2">
            <AllocationPieChart />
            <PerformanceSparklines />
            <PortfolioValueChart />
          </section>
        )}

        {/* Assets Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Your Assets</h2>
              <p className="text-sm text-muted-foreground">
                {hasAssets
                  ? `${assets.length} asset${assets.length > 1 ? "s" : ""} in your portfolio`
                  : "Start building your portfolio"}
              </p>
            </div>
            <AddAssetDialog />
          </div>

          <AssetList />
        </section>

        {/* Loading Overlay for Initial Load */}
        {isLoading && assets.length === 0 && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading your portfolio...</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>CryptoFolio - Portfolio Tracker & P/L Dashboard</p>
          <p>
            Data provided by{" "}
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              CoinGecko
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
