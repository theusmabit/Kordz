"use client"

import { useAutoScroll } from "@/hooks/use-auto-scroll"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { AutoScrollIndicator } from "./auto-scroll-indicator"

/**
 * Client component wrapper para funcionalidades interativas da página de música
 * - Auto-scroll
 * - Atalhos de teclado
 * - Indicador visual de auto-scroll
 */
export function SongPageClient() {
  useAutoScroll()
  useKeyboardShortcuts()

  return <AutoScrollIndicator />
}

