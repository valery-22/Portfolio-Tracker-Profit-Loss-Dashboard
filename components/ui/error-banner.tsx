"use client"

import { AlertTriangle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { usePortfolioStore } from "@/store/portfolio-store"

export function ErrorBanner() {
  const { error, clearError, fetchAllPrices } = usePortfolioStore()

  if (!error) return null

  return (
    <Alert variant="destructive" className="relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error fetching prices</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAllPrices()}
            className="border-destructive/50 hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      </AlertDescription>
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={clearError}>
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
