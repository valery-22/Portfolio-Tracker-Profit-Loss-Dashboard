"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { RefreshCw, Settings2, Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Logo } from "@/components/ui/logo"
import { usePortfolioStore } from "@/store/portfolio-store"
import type { RefreshInterval } from "@/types/portfolio"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const isLoading = usePortfolioStore((s) => s.isLoading)
  const lastUpdated = usePortfolioStore((s) => s.lastUpdated)
  const autoRefresh = usePortfolioStore((s) => s.autoRefresh)
  const refreshInterval = usePortfolioStore((s) => s.refreshInterval)
  const fetchAllPrices = usePortfolioStore((s) => s.fetchAllPrices)
  const setAutoRefresh = usePortfolioStore((s) => s.setAutoRefresh)
  const setRefreshInterval = usePortfolioStore((s) => s.setRefreshInterval)

  const [countdown, setCountdown] = useState<number>(refreshInterval)
  const [isDark, setIsDark] = useState(false)

  const hasMounted = useRef(false)
  const isFetching = useRef(false)

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString()
    : "Never"

  // Safe fetch wrapper
  const safeFetch = useCallback(async () => {
    if (isFetching.current) return
    isFetching.current = true

    try {
      await fetchAllPrices()
    } finally {
      isFetching.current = false
    }
  }, [fetchAllPrices])

  // Manual refresh button
  const handleRefresh = useCallback(() => {
    safeFetch()
    setCountdown(refreshInterval)
  }, [safeFetch, refreshInterval])

  // Initial load
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      safeFetch()
    }
  }, [safeFetch])

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) {
      setCountdown(refreshInterval)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          safeFetch()
          return refreshInterval
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoRefresh, refreshInterval, safeFetch])

  // Reset countdown when interval changes
  useEffect(() => {
    setCountdown(refreshInterval)
  }, [refreshInterval])

  // Trigger refresh on tab focus
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && autoRefresh && hasMounted.current) {
        safeFetch()
        setCountdown(refreshInterval)
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [autoRefresh, refreshInterval, safeFetch])

  // Dark mode toggle
  useEffect(() => {
    const root = document.documentElement
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isDark ? root.classList.add("dark") : root.classList.remove("dark")
  }, [isDark])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Logo size="sm" />

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Status */}
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span
              className={cn(
                "transition-colors",
                isLoading && "text-emerald-600"
              )}
            >
              {isLoading
                ? "Updating..."
                : `Updated: ${formattedLastUpdated}`}
            </span>

            {autoRefresh && (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span className="tabular-nums font-medium">
                  Next: {countdown}s
                </span>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              "relative bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all",
              isLoading && "ring-2 ring-emerald-500/50"
            )}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                isLoading && "animate-spin text-emerald-600"
              )}
            />
            {autoRefresh && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </Button>

          {/* Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-72" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Refresh Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure automatic price updates.
                  </p>
                </div>

                {/* Auto-refresh */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh" className="text-sm">
                    Auto-refresh
                  </Label>
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>

                {/* Interval */}
                <div className="grid gap-2">
                  <Label htmlFor="interval" className="text-sm">
                    Refresh interval
                  </Label>
                  <Select
                    value={refreshInterval.toString()}
                    onValueChange={(v) =>
                      setRefreshInterval(Number(v) as RefreshInterval)
                    }
                    disabled={!autoRefresh}
                  >
                    <SelectTrigger id="interval">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dark mode */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label className="text-sm">Dark mode</Label>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsDark(!isDark)}
                  >
                    {isDark ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
