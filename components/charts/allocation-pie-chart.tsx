"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePortfolioStore } from "@/store/portfolio-store"
import { calculateAssetMetrics, formatCurrency } from "@/lib/calculations"

// Chart color palette
const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#ec4899", // pink
  "#10b981", // emerald
  "#f97316", // orange
  "#6366f1", // indigo
]

interface ChartDataItem {
  name: string
  symbol: string
  value: number
  percentage: number
  color: string
}

export function AllocationPieChart() {
  const { assets, prices } = usePortfolioStore()

  const chartData = useMemo(() => {
    if (assets.length === 0) return []

    const assetsWithPrices = assets.map((asset) => calculateAssetMetrics(asset, prices[asset.coinId] ?? null))

    const totalValue = assetsWithPrices.reduce((sum, a) => sum + a.currentValue, 0)

    return assetsWithPrices
      .map((asset, index) => ({
        name: asset.name,
        symbol: asset.symbol,
        value: asset.currentValue,
        percentage: totalValue > 0 ? (asset.currentValue / totalValue) * 100 : 0,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
  }, [assets, prices])

  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asset Allocation</CardTitle>
          <CardDescription>Portfolio distribution by value</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Add assets to see allocation
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Asset Allocation</CardTitle>
        <CardDescription>Portfolio distribution by value</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={500}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataItem
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">{data.symbol}</p>
                        <p className="font-semibold mt-1">{formatCurrency(data.value)}</p>
                        <p className="text-sm text-muted-foreground">{data.percentage.toFixed(1)}% of portfolio</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.symbol}</span>
              <span className="text-muted-foreground ml-auto tabular-nums">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
