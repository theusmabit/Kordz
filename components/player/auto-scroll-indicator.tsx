"use client"

import { usePlayerStore } from "@/stores/player-store"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

export function AutoScrollIndicator() {
  const { isAutoScroll } = usePlayerStore()

  if (!isAutoScroll) return null

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[calc(25%+1rem)] lg:translate-x-0 z-50",
        "flex items-center gap-2",
        "bg-primary/90 text-primary-foreground",
        "px-3 py-1.5 rounded-full",
        "text-xs font-medium",
        "shadow-lg",
        "backdrop-blur-sm",
        "transition-opacity duration-200"
      )}
      aria-label="Auto-scroll ativo"
    >
      <Play className="h-3 w-3 fill-current" />
      <span>Auto-scroll</span>
    </div>
  )
}

