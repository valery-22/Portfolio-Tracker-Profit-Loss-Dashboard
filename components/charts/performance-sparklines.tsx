"use client"

import { useMemo } from "react"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePortfolioStore } from "@/store/portfolio-store"
import { calculateAssetMetrics, formatPercent } from "@/lib/calculations"
import { cn } from "@/lib/utils"

/**
 * Generates synthetic 24h performance data based on percentage change
 * This simulates what the price movement might have looked like
 */
function generateSparklineData(changePercent: number, points = 24) {
  const data: { value: number }[] = []
  const baseValue = 100
  const endValue = baseValue * (1 + changePercent / 100)
  const volatility = Math.abs(changePercent) / 10

  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    // Smooth interpolation with some randomness
    const trend = baseValue + (endValue - baseValue) * progress
    const noise = (Math.random() - 0.5) * volatility * 2
    data.push({ value: trend + noise })
  }

  // Ensure last point matches the actual change
  data[points - 1] = { value: endValue }

  return data
}

interface SparklineProps {
  data: { value: number }[]
  isPositive: boolean
}

function Sparkline({ data, isPositive }: SparklineProps) {
  const color = isPositive ? "#10b981" : "#ef4444"

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} animationDuration={300} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PerformanceSparklines() {
  const { assets, prices } = usePortfolioStore()

  const assetsWithPerformance = useMemo(() => {
    return assets
      .map((asset) => {
        const metrics = calculateAssetMetrics(asset, prices[asset.coinId] ?? null)
        const sparklineData = generateSparklineData(metrics.changePercent24h)
        return {
          ...metrics,
          sparklineData,
        }
      })
      .sort((a, b) => b.changePercent24h - a.changePercent24h)
  }, [assets, prices])

  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">24h Performance</CardTitle>
          <CardDescription>Price movement over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          Add assets to see performance
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">24h Performance</CardTitle>
        <CardDescription>Price movement over the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assetsWithPerformance.map((asset) => {
            const isPositive = asset.changePercent24h >= 0
            return (
              <div key={asset.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                {/* Asset Info */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="w-24 shrink-0">
                  <Sparkline data={asset.sparklineData} isPositive={isPositive} />
                </div>

                {/* Change Percentage */}
                <div
                  className={cn(
                    "flex items-center gap-1 min-w-20 justify-end",
                    isPositive ? "text-profit" : "text-loss",
                  )}
                >
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-medium tabular-nums text-sm">{formatPercent(asset.changePercent24h)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
