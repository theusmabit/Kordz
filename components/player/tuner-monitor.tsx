"use client"

import { Button } from "@/components/ui/button"
import { useTuner } from "@/hooks/use-tuner"
import { Gauge } from "lucide-react"
import { useMemo, useRef, useEffect, useState } from "react"
import { NOTES } from "@/lib/music-theory"

// Largura de cada item da fita (nota + marcadores)
const ITEM_WIDTH = 96 // w-24 = 96px

export function TunerMonitor() {
  const { start, stop, isListening, note, cents, volume, error } = useTuner()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Mede a largura do container
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const handleToggle = async () => {
    if (isListening) {
      stop()
    } else {
      await start()
    }
  }

  // Cria fita com escala cromática repetida 3 vezes
  const noteStrip = useMemo(() => {
    return [...NOTES, ...NOTES, ...NOTES]
  }, [])

  // Calcula o índice da nota na escala cromática
  const noteIndex = useMemo(() => {
    if (!note) return 12 // Retorna índice do meio (segunda repetição, início)
    const index = NOTES.indexOf(note as any)
    return index >= 0 ? index + 12 : 12 // +12 para estar na segunda repetição
  }, [note])

  // Calcula o deslocamento X baseado na nota e cents
  const stripTranslateX = useMemo(() => {
    if (!isListening || containerWidth === 0) return 0
    
    if (!note) {
      // Se não há nota, centraliza na segunda repetição
      const centerNotePosition = 12 * ITEM_WIDTH + ITEM_WIDTH / 2
      return containerWidth / 2 - centerNotePosition
    }

    // Posição do centro da nota atual
    const baseNotePosition = noteIndex * ITEM_WIDTH + ITEM_WIDTH / 2
    // Ajuste fino baseado nos cents (50 cents = 1 semitom = ITEM_WIDTH)
    const centsOffset = (cents / 50) * ITEM_WIDTH
    const totalNotePosition = baseNotePosition + centsOffset

    // Alinha o centro da nota ao marcador central (50% do container)
    return containerWidth / 2 - totalNotePosition
  }, [note, noteIndex, cents, isListening, containerWidth])

  // Cor do ícone baseado no volume
  const gaugeColor = useMemo(() => {
    if (!isListening) return "text-muted-foreground"
    if (volume > 0.05) return "text-primary"
    if (volume > 0.01) return "text-muted-foreground/70"
    return "text-muted-foreground"
  }, [isListening, volume])

  return (
    <div className="border rounded-xl flex h-20 items-center overflow-hidden bg-card">
      {/* Parte 1: Botão Ativador (Esquerda) */}
      <button
        onClick={handleToggle}
        disabled={!!error}
        className={`
          h-full px-4 flex items-center justify-center
          border-r transition-colors
          ${isListening 
            ? "bg-primary/10 hover:bg-primary/20" 
            : "bg-muted/30 hover:bg-muted/50"
          }
          ${error ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-label={isListening ? "Desativar afinador" : "Ativar afinador"}
      >
        <Gauge 
          className={`h-6 w-6 transition-colors duration-200 ${gaugeColor}`}
        />
      </button>

      {/* Parte 2: Régua Deslizante (Direita) */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden h-full bg-muted/20">
        {isListening ? (
          <>
            {/* Marcador Central */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-primary z-10" />

            {/* Fita de Notas */}
            <div
              className="absolute inset-y-0 flex items-center transition-transform duration-200 ease-out"
              style={{
                transform: `translateX(${stripTranslateX}px)`,
              }}
            >
              {noteStrip.map((noteItem, index) => {
                const isCenterNote = index === noteIndex
                const isSharp = noteItem.includes("#")

                return (
                  <div
                    key={`${noteItem}-${index}`}
                    className="flex items-center justify-center"
                    style={{ width: `${ITEM_WIDTH}px`, minWidth: `${ITEM_WIDTH}px` }}
                  >
                    {/* Marcadores laterais (tracinhos) */}
                    <div className="flex-1 flex items-center justify-end pr-2">
                      <div className="w-px h-8 bg-border" />
                    </div>

                    {/* Nota */}
                    <div
                      className={`
                        px-2 font-bold font-mono text-sm
                        ${isCenterNote 
                          ? "text-primary text-base" 
                          : "text-muted-foreground"
                        }
                        ${isSharp ? "text-xs" : ""}
                      `}
                    >
                      {noteItem}
                    </div>

                    {/* Marcadores laterais (tracinhos) */}
                    <div className="flex-1 flex items-center justify-start pl-2">
                      <div className="w-px h-8 bg-border" />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          /* Estado Desligado */
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              Toque para iniciar
            </span>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
            <span className="text-xs text-destructive px-2 text-center">
              {error}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
