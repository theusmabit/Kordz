"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PlaylistNavigatorProps {
  currentIndex?: number
  totalSongs?: number
  onPrevious?: () => void
  onNext?: () => void
}

export function PlaylistNavigator({
  currentIndex = 3,
  totalSongs = 12,
  onPrevious,
  onNext,
}: PlaylistNavigatorProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Música anterior</span>
      </Button>
      <span className="text-sm font-medium text-muted-foreground">
        {currentIndex}/{totalSongs}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próxima música</span>
      </Button>
    </div>
  )
}

