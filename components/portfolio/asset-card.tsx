"use client"

import { useState } from "react"
import { MoreVertical, Pencil, Trash2, TrendingUp, TrendingDown, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AssetWithPrice } from "@/types/portfolio"
import { formatCurrency, formatPercent } from "@/lib/calculations"
import { cn } from "@/lib/utils"

interface AssetCardProps {
  asset: AssetWithPrice
  onEdit: () => void
  onDelete: () => void
}

export function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isProfitable = asset.profitLoss >= 0
  const is24hPositive = asset.changePercent24h >= 0

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 animate-fade-in border hover:border-primary/50 relative overflow-hidden">
        {/* Gradient overlay on hover */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
            isProfitable
              ? "bg-gradient-to-br from-emerald-500/5 to-teal-500/5"
              : "bg-gradient-to-br from-red-500/5 to-orange-500/5",
          )}
        />

        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                  "bg-gradient-to-br from-emerald-500 to-teal-500 text-white",
                  "group-hover:scale-110 transition-transform duration-300",
                )}
              >
                {asset.symbol.slice(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-base">{asset.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="tabular-nums">{asset.quantity.toLocaleString()}</span>
                  <span className="text-xs">{asset.symbol}</span>
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Asset
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Current Price</p>
              <p className="font-semibold text-lg tabular-nums">{formatCurrency(asset.currentPrice)}</p>
              <div
                className={cn(
                  "text-xs flex items-center gap-1 font-medium px-2 py-0.5 rounded-full w-fit",
                  is24hPositive ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss",
                )}
              >
                {is24hPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatPercent(asset.changePercent24h)}
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Current Value</p>
              <p className="font-bold text-lg tabular-nums">{formatCurrency(asset.currentValue)}</p>
              <p className="text-xs text-muted-foreground">Buy: {formatCurrency(asset.buyPrice)}</p>
            </div>
          </div>

          <div
            className={cn(
              "mt-4 p-4 rounded-xl border transition-all duration-300",
              isProfitable
                ? "bg-profit/5 border-profit/20 hover:bg-profit/10"
                : "bg-loss/5 border-loss/20 hover:bg-loss/10",
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">Profit / Loss</p>
                <p
                  className={cn(
                    "font-bold text-xl tabular-nums flex items-center gap-1.5",
                    isProfitable ? "text-profit" : "text-loss",
                  )}
                >
                  {isProfitable && Math.abs(asset.profitLossPercent) > 20 && (
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  )}
                  {isProfitable ? "+" : ""}
                  {formatCurrency(asset.profitLoss)}
                </p>
              </div>
              <div
                className={cn(
                  "px-3 py-2 rounded-full text-base font-bold shadow-sm",
                  isProfitable ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss",
                )}
              >
                {formatPercent(asset.profitLossPercent)}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Cost Basis</span>
              <span className="text-xs font-medium tabular-nums">{formatCurrency(asset.costBasis)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {asset.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {asset.quantity} {asset.symbol} from your portfolio. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
