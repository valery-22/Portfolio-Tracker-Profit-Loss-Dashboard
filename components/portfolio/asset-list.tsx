"use client"

import { useMemo, useState } from "react"
import { usePortfolioStore } from "@/store/portfolio-store"
import { calculateAssetMetrics } from "@/lib/calculations"
import { AssetCard } from "./asset-card"
import { EditAssetDialog } from "./edit-asset-dialog"
import type { Asset } from "@/types/portfolio"

export function AssetList() {
  const { assets, prices, removeAsset } = usePortfolioStore()
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const assetsWithPrices = useMemo(() => {
    return assets
      .map((asset) => calculateAssetMetrics(asset, prices[asset.coinId] ?? null))
      .sort((a, b) => b.currentValue - a.currentValue) // Sort by value descending
  }, [assets, prices])

  if (assets.length === 0) {
    return null
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assetsWithPrices.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onEdit={() => setEditingAsset(asset)}
            onDelete={() => removeAsset(asset.id)}
          />
        ))}
      </div>

      {editingAsset && (
        <EditAssetDialog
          asset={editingAsset}
          open={!!editingAsset}
          onOpenChange={(open) => !open && setEditingAsset(null)}
        />
      )}
    </>
  )
}
