"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          sizes[size],
          "relative flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 hover:scale-105",
        )}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 animate-gradient" />

        {/* Hexagon shape overlay */}
        <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full p-2" fill="none">
          <path
            d="M50 5 L90 30 L90 70 L50 95 L10 70 L10 30 Z"
            stroke="white"
            strokeWidth="4"
            fill="none"
            className="animate-pulse-subtle"
          />
          <path d="M50 25 L70 37.5 L70 62.5 L50 75 L30 62.5 L30 37.5 Z" fill="white" className="opacity-90" />
          <circle cx="50" cy="50" r="8" fill="currentColor" className="text-emerald-500" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              textSizes[size],
              "font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
            )}
          >
            CryptoFolio
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block">Smart Portfolio Tracker</span>
        </div>
      )}
    </div>
  )
}
