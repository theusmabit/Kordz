"use client"

import { useEffect } from "react"
import { usePlayerStore } from "@/stores/player-store"

/**
 * Hook para atalhos de teclado globais
 * - Space: Alterna auto-scroll (Play/Pause)
 * - ArrowRight: Próxima música
 * - ArrowLeft: Música anterior
 * 
 * Guardrail: Não funciona se o usuário estiver digitando em input/textarea
 */
export function useKeyboardShortcuts() {
  const { isAutoScroll, setIsAutoScroll } = usePlayerStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guardrail: Não funciona se estiver digitando em input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case " ": // Space
          e.preventDefault()
          setIsAutoScroll(!isAutoScroll)
          break

        case "ArrowRight":
          e.preventDefault()
          // TODO: Implementar navegação para próxima música
          console.log("Próxima música")
          break

        case "ArrowLeft":
          e.preventDefault()
          // TODO: Implementar navegação para música anterior
          console.log("Música anterior")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isAutoScroll, setIsAutoScroll])
}

