"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PlaylistNavigator } from "./playlist-navigator"
import { MetronomeControl } from "./metronome-control"
import { TunerMonitor } from "./tuner-monitor"
import { Minus, Plus, Play, Pause } from "lucide-react"
import { usePlayerStore } from "@/stores/player-store"
import { formatTransposition } from "@/lib/music-theory"

export function SidebarTools() {
  const { 
    transposition, 
    increaseKey, 
    decreaseKey, 
    resetKey, 
    isAutoScroll, 
    setIsAutoScroll, 
    autoScrollSpeed, 
    setAutoScrollSpeed,
    fontSize,
    setFontSize,
    isSimplified,
    toggleSimplification
  } = usePlayerStore()

  const displayValue = transposition === 0 ? "0" : formatTransposition(transposition)

  const decreaseSpeed = () => {
    setAutoScrollSpeed(Math.max(0, autoScrollSpeed - 5))
  }

  const increaseSpeed = () => {
    setAutoScrollSpeed(Math.min(100, autoScrollSpeed + 5))
  }

  const decreaseFontSize = () => {
    setFontSize(Math.max(12, fontSize - 1))
  }

  const increaseFontSize = () => {
    setFontSize(Math.min(24, fontSize + 1))
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 p-6 space-y-6">
        {/* Playlist Navigator */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Navegação</h3>
          <PlaylistNavigator />
        </div>

        {/* Transpositor */}
        <div className="border rounded-xl flex h-20 items-center overflow-hidden bg-card">
          {/* Parte 1: Botão Reset (Esquerda) - Só aparece se transposition !== 0 */}
          {transposition !== 0 ? (
            <button
              onClick={resetKey}
              className="
                h-full px-4 flex items-center justify-center
                border-r transition-colors
                bg-muted/30 hover:bg-muted/50
                cursor-pointer
              "
              aria-label="Resetar transposição"
            >
              <span className="text-sm font-semibold text-muted-foreground">0</span>
            </button>
          ) : (
            <div className="h-full px-4 flex items-center justify-center border-r bg-muted/20">
              <span className="text-xs font-medium text-muted-foreground">Tom</span>
            </div>
          )}

          {/* Parte 2: Controle de Transposição (Direita) */}
          <div className="flex-1 flex items-center justify-between px-6">
            {/* Botão Menos */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                decreaseKey()
              }}
              aria-label="Diminuir tom"
            >
              <Minus className="h-4 w-4" />
            </Button>

            {/* Display Transposição */}
            <div className="text-2xl font-mono font-bold text-center flex-1">
              {displayValue}
            </div>

            {/* Botão Mais */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                increaseKey()
              }}
              aria-label="Aumentar tom"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Auto-scroll */}
        <div className="border rounded-xl flex h-20 items-center overflow-hidden bg-card">
          {/* Parte 1: Botão Ativador (Esquerda) */}
          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`
              h-full px-4 flex items-center justify-center
              border-r transition-colors
              ${isAutoScroll 
                ? "bg-primary hover:bg-primary/90" 
                : "bg-muted/30 hover:bg-muted/50"
              }
              cursor-pointer
            `}
            aria-label={isAutoScroll ? "Pausar auto-scroll" : "Iniciar auto-scroll"}
          >
            {isAutoScroll ? (
              <Pause 
                className={`h-6 w-6 transition-colors duration-200 ${
                  isAutoScroll 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground"
                }`}
              />
            ) : (
              <Play 
                className={`h-6 w-6 transition-colors duration-200 ${
                  isAutoScroll 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground"
                }`}
              />
            )}
          </button>

          {/* Parte 2: Controle de Velocidade (Direita) */}
          <div className="flex-1 flex items-center justify-between px-6">
            {/* Botão Menos */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                decreaseSpeed()
              }}
              disabled={!isAutoScroll}
              aria-label="Diminuir velocidade"
            >
              <Minus className="h-4 w-4" />
            </Button>

            {/* Display Velocidade */}
            <div className="text-2xl font-mono font-bold text-center flex-1">
              {autoScrollSpeed}
            </div>

            {/* Botão Mais */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                increaseSpeed()
              }}
              disabled={!isAutoScroll}
              aria-label="Aumentar velocidade"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Metronome */}
        <MetronomeControl />

        {/* Tuner */}
        <TunerMonitor />

        {/* Text Appearance Action Group */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-muted-foreground">
            Text Appearance
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={decreaseFontSize}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Diminuir tamanho da fonte</span>
            </Button>
            <span className="flex-1 text-sm font-medium text-center">
              T {fontSize}px
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={increaseFontSize}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Aumentar tamanho da fonte</span>
            </Button>
          </div>
        </div>

        {/* Simplificar Acordes Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Simplificar Acordes</label>
          <Switch checked={isSimplified} onCheckedChange={toggleSimplification} />
        </div>
      </div>

      {/* Footer - Reserved for YouTube Player */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          Player YouTube
        </div>
      </div>
    </div>
  )
}

