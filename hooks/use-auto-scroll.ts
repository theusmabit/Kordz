"use client"

import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/stores/player-store"

/**
 * Hook para auto-scroll suave da página
 * Usa requestAnimationFrame para animação fluida
 * Pausa automaticamente ao chegar no fim da página
 */
export function useAutoScroll() {
  const { isAutoScroll, autoScrollSpeed } = usePlayerStore()
  const animationFrameRef = useRef<number | null>(null)
  const lastScrollTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!isAutoScroll) {
      // Limpa o animation frame se o auto-scroll estiver desativado
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    // Mapeia velocidade (0-100) para pixels por segundo
    // 0 = parado, 100 = ~300 pixels por segundo (bem rápido)
    const pixelsPerSecond = (autoScrollSpeed / 100) * 300

    const scroll = (currentTime: number) => {
      // Calcula delta time em segundos para scroll consistente
      const deltaTime = lastScrollTimeRef.current 
        ? (currentTime - lastScrollTimeRef.current) / 1000 // Converte para segundos
        : 0.016 // ~60fps como padrão inicial

      const scrollAmount = pixelsPerSecond * deltaTime

      // Verifica se chegou no fim da página
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollBottom = scrollTop + windowHeight

      if (scrollBottom >= documentHeight - 1) {
        // Chegou no fim, pausa o auto-scroll
        usePlayerStore.getState().setIsAutoScroll(false)
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        return
      }

      // Faz o scroll
      window.scrollBy({
        top: scrollAmount,
        behavior: "auto", // Usa 'auto' para performance, o requestAnimationFrame já garante suavidade
      })

      lastScrollTimeRef.current = currentTime
      animationFrameRef.current = requestAnimationFrame(scroll)
    }

    // Inicia o scroll
    lastScrollTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(scroll)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isAutoScroll, autoScrollSpeed])
}

