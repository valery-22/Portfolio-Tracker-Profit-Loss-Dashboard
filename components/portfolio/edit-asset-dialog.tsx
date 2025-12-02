"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePortfolioStore } from "@/store/portfolio-store"
import type { Asset } from "@/types/portfolio"

interface EditAssetDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAssetDialog({ asset, open, onOpenChange }: EditAssetDialogProps) {
  const { updateAsset } = usePortfolioStore()
  const [quantity, setQuantity] = useState(asset.quantity.toString())
  const [buyPrice, setBuyPrice] = useState(asset.buyPrice.toString())

  const handleSave = () => {
    const parsedQuantity = Number.parseFloat(quantity)
    const parsedBuyPrice = Number.parseFloat(buyPrice)

    if (isNaN(parsedQuantity) || isNaN(parsedBuyPrice) || parsedQuantity <= 0 || parsedBuyPrice <= 0) {
      return
    }

    updateAsset(asset.id, {
      quantity: parsedQuantity,
      buyPrice: parsedBuyPrice,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {asset.name}</DialogTitle>
          <DialogDescription>Update the quantity or buy price for your {asset.symbol} holding.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="buyPrice">Buy Price (USD)</Label>
            <Input
              id="buyPrice"
              type="number"
              step="any"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
