"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, DollarSign, Activity, Award, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePortfolioStore } from "@/store/portfolio-store"
import { calculateAssetMetrics, calculatePortfolioSummary, formatCurrency, formatPercent } from "@/lib/calculations"
import { cn } from "@/lib/utils"

export function PortfolioSummary() {
  const { assets, prices, isLoading } = usePortfolioStore()

  const summary = useMemo(() => {
    const assetsWithPrices = assets.map((asset) => calculateAssetMetrics(asset, prices[asset.coinId] ?? null))
    return calculatePortfolioSummary(assetsWithPrices)
  }, [assets, prices])

  const isProfitable = summary.totalProfitLoss >= 0
  const is24hPositive = summary.total24hChange >= 0

  if (assets.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/30 hover:border-primary/50 transition-colors duration-300">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 mb-4 animate-pulse-subtle">
            <DollarSign className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Start Your Portfolio Journey</h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            Add your first cryptocurrency to track real-time performance and profit/loss analytics.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 group-hover:from-emerald-500/10 group-hover:via-teal-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
          <div className="p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className={cn("text-2xl font-bold tabular-nums", isLoading && "animate-pulse-subtle")}>
            {formatCurrency(summary.totalValue)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                "text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full",
                isProfitable ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss",
              )}
            >
              {isProfitable ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatPercent(summary.totalProfitLossPercent)}
            </span>
            <span className="text-xs text-muted-foreground">all time</span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            is24hPositive
              ? "bg-gradient-to-br from-emerald-500/5 to-teal-500/5"
              : "bg-gradient-to-br from-red-500/5 to-orange-500/5",
          )}
        />
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">24h Change</CardTitle>
          <div
            className={cn(
              "p-2 rounded-full transition-colors",
              is24hPositive ? "bg-profit/10 group-hover:bg-profit/20" : "bg-loss/10 group-hover:bg-loss/20",
            )}
          >
            <Activity className={cn("h-4 w-4", is24hPositive ? "text-profit" : "text-loss")} />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div
            className={cn(
              "text-2xl font-bold tabular-nums",
              is24hPositive ? "text-profit" : "text-loss",
              isLoading && "animate-pulse-subtle",
            )}
          >
            {is24hPositive ? "+" : ""}
            {formatCurrency(summary.total24hChange)}
          </div>
          <p
            className={cn(
              "text-xs flex items-center gap-1 mt-2 font-medium",
              is24hPositive ? "text-profit" : "text-loss",
            )}
          >
            {is24hPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatPercent(summary.total24hChangePercent)} vs yesterday
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            isProfitable
              ? "bg-gradient-to-br from-emerald-500/5 to-teal-500/5"
              : "bg-gradient-to-br from-red-500/5 to-orange-500/5",
          )}
        />
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total P/L</CardTitle>
          <div
            className={cn(
              "p-2 rounded-full transition-colors",
              isProfitable ? "bg-profit/10 group-hover:bg-profit/20" : "bg-loss/10 group-hover:bg-loss/20",
            )}
          >
            {isProfitable ? (
              <TrendingUp className="h-4 w-4 text-profit" />
            ) : (
              <TrendingDown className="h-4 w-4 text-loss" />
            )}
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div
            className={cn(
              "text-2xl font-bold tabular-nums",
              isProfitable ? "text-profit" : "text-loss",
              isLoading && "animate-pulse-subtle",
            )}
          >
            {isProfitable ? "+" : ""}
            {formatCurrency(summary.totalProfitLoss)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Cost: {formatCurrency(summary.totalCostBasis)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Top Performers</CardTitle>
          <div className="p-2 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
            <Award className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent className="relative space-y-3">
          {summary.bestPerformer && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-profit/5 hover:bg-profit/10 transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-profit animate-pulse" />
                <span className="text-sm font-medium">{summary.bestPerformer.symbol}</span>
              </div>
              <span className="text-sm font-bold text-profit tabular-nums">
                {formatPercent(summary.bestPerformer.profitLossPercent)}
              </span>
            </div>
          )}
          {summary.worstPerformer && summary.worstPerformer.id !== summary.bestPerformer?.id && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-loss/5 hover:bg-loss/10 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-loss" />
                <span className="text-sm font-medium">{summary.worstPerformer.symbol}</span>
              </div>
              <span className="text-sm font-bold text-loss tabular-nums">
                {formatPercent(summary.worstPerformer.profitLossPercent)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
