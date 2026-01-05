"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseMetronomeOptions {
  initialBpm?: number
  beatsPerMeasure?: number
}

const SCHEDULE_AHEAD_TIME = 0.1 // 100ms lookahead
const NOTE_LENGTH = 0.1 // 100ms duration for each click
const HIGH_CLICK_FREQ = 1000 // Hz for beat 1
const LOW_CLICK_FREQ = 800 // Hz for other beats

export function useMetronome({ 
  initialBpm = 120, 
  beatsPerMeasure = 4 
}: UseMetronomeOptions = {}) {
  const [bpm, setBpm] = useState(initialBpm)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef<number>(0)
  const currentBeatRef = useRef<number>(0)
  const schedulerIntervalRef = useRef<number | null>(null)
  const isPlayingRef = useRef<boolean>(false)

  // Initialize AudioContext on first user interaction
  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Play a single click
  const playClick = useCallback((beatIndex: number) => {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // High click for beat 1, low click for others
    const frequency = beatIndex === 0 ? HIGH_CLICK_FREQ : LOW_CLICK_FREQ
    oscillator.frequency.value = frequency
    oscillator.type = "triangle"

    // Envelope: quick attack and decay (increased volume)
    const now = ctx.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + NOTE_LENGTH)

    oscillator.start(now)
    oscillator.stop(now + NOTE_LENGTH)
  }, [ensureAudioContext])

  // Schedule next notes
  const scheduleNotes = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current) return

    const ctx = audioContextRef.current
    const currentTime = ctx.currentTime
    const secondsPerBeat = 60.0 / bpm

    while (nextNoteTimeRef.current < currentTime + SCHEDULE_AHEAD_TIME) {
      // Play the click
      playClick(currentBeatRef.current)
      
      // Update visual feedback
      setCurrentBeat(currentBeatRef.current)
      
      // Move to next beat
      nextNoteTimeRef.current += secondsPerBeat
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasure
    }
  }, [bpm, beatsPerMeasure, playClick])

  // Start/stop metronome
  useEffect(() => {
    if (isPlaying) {
      const startMetronome = async () => {
        const ctx = ensureAudioContext()
        if (!ctx) return

        // Resume AudioContext if suspended (required by some browsers)
        if (ctx.state === "suspended") {
          await ctx.resume()
        }

        isPlayingRef.current = true
        const currentTime = ctx.currentTime
        nextNoteTimeRef.current = currentTime + 0.01 // Start very soon
        currentBeatRef.current = 0

        // Start scheduler
        const interval = window.setInterval(scheduleNotes, 25) // Check every 25ms
        schedulerIntervalRef.current = interval
      }

      startMetronome()
    } else {
      isPlayingRef.current = false
      if (schedulerIntervalRef.current !== null) {
        clearInterval(schedulerIntervalRef.current)
        schedulerIntervalRef.current = null
      }
      setCurrentBeat(0)
      currentBeatRef.current = 0
    }

    return () => {
      if (schedulerIntervalRef.current !== null) {
        clearInterval(schedulerIntervalRef.current)
        schedulerIntervalRef.current = null
      }
    }
  }, [isPlaying, scheduleNotes, ensureAudioContext])

  const start = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const setBpmValue = useCallback((newBpm: number) => {
    const clamped = Math.max(40, Math.min(240, newBpm))
    setBpm(clamped)
  }, [])

  const increaseBpm = useCallback(() => {
    setBpm(prev => Math.min(240, prev + 1))
  }, [])

  const decreaseBpm = useCallback(() => {
    setBpm(prev => Math.max(40, prev - 1))
  }, [])

  return {
    bpm,
    isPlaying,
    currentBeat,
    setBpm: setBpmValue,
    increaseBpm,
    decreaseBpm,
    start,
    stop,
    toggle,
  }
}

