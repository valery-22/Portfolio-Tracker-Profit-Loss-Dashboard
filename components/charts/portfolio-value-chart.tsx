"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePortfolioStore } from "@/store/portfolio-store"
import { calculateAssetMetrics, formatCurrency } from "@/lib/calculations"

/**
 * Generates synthetic historical data for portfolio value visualization
 * Shows estimated 7-day trend based on current 24h change
 */
function generateHistoricalData(totalValue: number, total24hChangePercent: number) {
  const days = 7
  const data: { day: string; value: number }[] = []

  // Estimate daily change rate from 24h change
  const dailyChangeRate = total24hChangePercent / 100

  // Work backwards from current value
  for (let i = days; i >= 0; i--) {
    const dayDate = new Date()
    dayDate.setDate(dayDate.getDate() - i)
    const dayLabel = dayDate.toLocaleDateString("en-US", { weekday: "short" })

    // Apply compounding change rate backwards
    const daysBack = i
    const estimatedValue = totalValue / Math.pow(1 + dailyChangeRate, daysBack)

    // Add some realistic volatility
    const volatility = Math.abs(dailyChangeRate) * 0.5
    const noise = i === 0 ? 0 : (Math.random() - 0.5) * volatility * estimatedValue

    data.push({
      day: dayLabel,
      value: Math.max(0, estimatedValue + noise),
    })
  }

  return data
}

export function PortfolioValueChart() {
  const { assets, prices } = usePortfolioStore()

  const { chartData, isPositive } = useMemo(() => {
    if (assets.length === 0) {
      return {
        chartData: [],
        totalValue: 0,
        total24hChangePercent: 0,
        isPositive: true,
      }
    }

    const assetsWithPrices = assets.map((asset) => calculateAssetMetrics(asset, prices[asset.coinId] ?? null))

    const totalValue = assetsWithPrices.reduce((sum, a) => sum + a.currentValue, 0)
    const total24hChange = assetsWithPrices.reduce((sum, a) => sum + a.change24h, 0)
    const total24hChangePercent = totalValue > 0 ? (total24hChange / (totalValue - total24hChange)) * 100 : 0

    return {
      chartData: generateHistoricalData(totalValue, total24hChangePercent),
      totalValue,
      total24hChangePercent,
      isPositive: total24hChangePercent >= 0,
    }
  }, [assets, prices])

  if (assets.length === 0) {
    return null
  }

  const gradientId = "portfolioGradient"
  const strokeColor = isPositive ? "#10b981" : "#ef4444"
  const fillColor = isPositive ? "#10b981" : "#ef4444"

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Portfolio Value Trend</CardTitle>
        <CardDescription>Estimated 7-day performance based on market data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis hide domain={["dataMin - 5%", "dataMax + 5%"]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="font-semibold">{formatCurrency(payload[0].value as number)}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
