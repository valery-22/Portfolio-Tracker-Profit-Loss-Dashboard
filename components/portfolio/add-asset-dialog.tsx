"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Loader2, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePortfolioStore } from "@/store/portfolio-store"
import { searchCoins, POPULAR_COINS } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

interface CoinSearchResult {
  id: string
  symbol: string
  name: string
  thumb?: string
}

export function AddAssetDialog() {
  const { addAsset, assets } = usePortfolioStore()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"select" | "details">("select")

  // Coin selection state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CoinSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState<CoinSearchResult | null>(null)

  // Asset details state
  const [quantity, setQuantity] = useState("")
  const [buyPrice, setBuyPrice] = useState("")

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Search for coins when query changes
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setSearchResults([])
      return
    }

    const doSearch = async () => {
      setIsSearching(true)
      try {
        const results = await searchCoins(debouncedSearch)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    doSearch()
  }, [debouncedSearch])

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setStep("select")
      setSearchQuery("")
      setSearchResults([])
      setSelectedCoin(null)
      setQuantity("")
      setBuyPrice("")
    }
  }

  // Select a coin and move to details step
  const handleSelectCoin = (coin: CoinSearchResult) => {
    setSelectedCoin(coin)
    setStep("details")
  }

  // Add the asset to portfolio
  const handleAddAsset = () => {
    if (!selectedCoin) return

    const parsedQuantity = Number.parseFloat(quantity)
    const parsedBuyPrice = Number.parseFloat(buyPrice)

    if (isNaN(parsedQuantity) || isNaN(parsedBuyPrice) || parsedQuantity <= 0 || parsedBuyPrice <= 0) {
      return
    }

    addAsset({
      coinId: selectedCoin.id,
      symbol: selectedCoin.symbol.toUpperCase(),
      name: selectedCoin.name,
      quantity: parsedQuantity,
      buyPrice: parsedBuyPrice,
    })

    handleOpenChange(false)
  }

  // Check if coin is already in portfolio
  const isInPortfolio = (coinId: string) => assets.some((a) => a.coinId === coinId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add Cryptocurrency</DialogTitle>
              <DialogDescription>Search for a cryptocurrency to add to your portfolio.</DialogDescription>
            </DialogHeader>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coins (e.g., Bitcoin, ETH)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Results or Popular Coins */}
            <div className="max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No results found for &quot;{searchQuery}&quot;</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => handleSelectCoin(coin)}
                      disabled={isInPortfolio(coin.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                        isInPortfolio(coin.id) ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-muted",
                      )}
                    >
                      {coin.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coin.thumb || "/placeholder.svg"} alt={coin.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {coin.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{coin.name}</p>
                        <p className="text-sm text-muted-foreground">{coin.symbol.toUpperCase()}</p>
                      </div>
                      {isInPortfolio(coin.id) && <span className="text-xs text-muted-foreground">In portfolio</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Star className="h-4 w-4" />
                    Popular Cryptocurrencies
                  </div>
                  <div className="space-y-1">
                    {POPULAR_COINS.map((coin) => (
                      <button
                        key={coin.id}
                        onClick={() => handleSelectCoin(coin)}
                        disabled={isInPortfolio(coin.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                          isInPortfolio(coin.id) ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-muted",
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {coin.symbol.slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{coin.name}</p>
                          <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                        </div>
                        {isInPortfolio(coin.id) && <span className="text-xs text-muted-foreground">In portfolio</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add {selectedCoin?.name}</DialogTitle>
              <DialogDescription>Enter the quantity and your average buy price.</DialogDescription>
            </DialogHeader>

            {/* Selected Coin Display */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {selectedCoin?.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="font-medium">{selectedCoin?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedCoin?.symbol.toUpperCase()}</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setStep("select")}>
                Change
              </Button>
            </div>

            {/* Input Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 0.5"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  How many {selectedCoin?.symbol.toUpperCase()} do you own?
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buyPrice">Average Buy Price (USD)</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="any"
                  min="0"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="e.g., 45000"
                />
                <p className="text-xs text-muted-foreground">
                  Your average purchase price per {selectedCoin?.symbol.toUpperCase()}.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button
                onClick={handleAddAsset}
                disabled={
                  !quantity || !buyPrice || Number.parseFloat(quantity) <= 0 || Number.parseFloat(buyPrice) <= 0
                }
              >
                Add to Portfolio
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
