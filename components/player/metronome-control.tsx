"use client"

import { Button } from "@/components/ui/button"
import { Activity, Minus, Plus } from "lucide-react"
import { useMetronome } from "@/hooks/use-metronome"

export function MetronomeControl() {
  const { 
    bpm, 
    isPlaying, 
    setBpm, 
    toggle 
  } = useMetronome({ initialBpm: 120, beatsPerMeasure: 4 })

  const handleDecrease = () => {
    setBpm(Math.max(40, bpm - 5))
  }

  const handleIncrease = () => {
    setBpm(Math.min(240, bpm + 5))
  }

  const activityColor = isPlaying 
    ? "text-primary-foreground" 
    : "text-muted-foreground"

  return (
    <div className="border rounded-xl flex h-20 items-center overflow-hidden bg-card">
      {/* Parte 1: Botão Ativador (Esquerda) */}
      <button
        onClick={toggle}
        className={`
          h-full px-4 flex items-center justify-center
          border-r transition-colors
          ${isPlaying 
            ? "bg-primary hover:bg-primary/90" 
            : "bg-muted/30 hover:bg-muted/50"
          }
          cursor-pointer
        `}
        aria-label={isPlaying ? "Parar metrônomo" : "Iniciar metrônomo"}
      >
        <Activity 
          className={`h-6 w-6 transition-colors duration-200 ${activityColor} ${isPlaying ? "animate-pulse" : ""}`}
        />
      </button>

      {/* Parte 2: Controle de BPM (Direita) */}
      <div className="flex-1 flex items-center justify-between px-6">
        {/* Botão Menos */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            handleDecrease()
          }}
          aria-label="Diminuir 5 BPM"
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Display BPM */}
        <div className="text-2xl font-mono font-bold text-center flex-1">
          {bpm} BPM
        </div>

        {/* Botão Mais */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            handleIncrease()
          }}
          aria-label="Aumentar 5 BPM"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

