import { useState, useRef, useCallback, useEffect } from "react"
import { frequencyToNote } from "@/lib/music-theory"

interface TunerState {
  note: string
  octave: number
  cents: number
  frequency: number
}

interface UseTunerReturn {
  start: () => Promise<void>
  stop: () => void
  isListening: boolean
  note: string
  octave: number
  cents: number
  frequency: number
  volume: number
  error: string | null
}

/**
 * Calcula o RMS (Root Mean Square) para medir o volume médio do sinal
 */
function calculateRMS(buffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}

/**
 * Algoritmo de Autocorrelação para detecção de pitch
 * Mais robusto que Zero Crossing para instrumentos como violão
 */
function autocorrelationPitch(buffer: Float32Array, sampleRate: number): number {
  const bufferSize = buffer.length
  const minPeriod = Math.floor(sampleRate / 800) // ~800Hz máximo
  const maxPeriod = Math.floor(sampleRate / 80) // ~80Hz mínimo
  
  let bestPeriod = 0
  let bestCorrelation = 0
  
  // Normaliza o buffer
  let maxValue = 0
  for (let i = 0; i < bufferSize; i++) {
    if (Math.abs(buffer[i]) > maxValue) {
      maxValue = Math.abs(buffer[i])
    }
  }
  
  if (maxValue === 0) return 0
  
  const normalizedBuffer = new Float32Array(bufferSize)
  for (let i = 0; i < bufferSize; i++) {
    normalizedBuffer[i] = buffer[i] / maxValue
  }
  
  // Autocorrelação
  for (let period = minPeriod; period <= maxPeriod; period++) {
    let correlation = 0
    for (let i = 0; i < bufferSize - period; i++) {
      correlation += normalizedBuffer[i] * normalizedBuffer[i + period]
    }
    correlation /= bufferSize - period
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation
      bestPeriod = period
    }
  }
  
  // Threshold mínimo para considerar sinal válido (reduzido para maior sensibilidade)
  if (bestCorrelation < 0.15) {
    return 0
  }
  
  return sampleRate / bestPeriod
}

export function useTuner(): UseTunerReturn {
  const [isListening, setIsListening] = useState(false)
  const [tunerState, setTunerState] = useState<TunerState>({
    note: "",
    octave: 0,
    cents: 0,
    frequency: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState<number>(0)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const dataArrayRef = useRef<Float32Array | null>(null)
  const isMountedRef = useRef(true)
  const lastUpdateTimeRef = useRef<number>(0)
  const lastValidStateRef = useRef<TunerState | null>(null)
  
  // Limiar de RMS para Noise Gate (valor baixo para maior sensibilidade)
  const RMS_THRESHOLD = 0.001
  // Throttle de atualização (100ms)
  const UPDATE_INTERVAL_MS = 100

  const processAudio = useCallback(() => {
    if (!isMountedRef.current || !analyserRef.current || !dataArrayRef.current) {
      return
    }

    const dataArray = dataArrayRef.current
    analyserRef.current.getFloatTimeDomainData(dataArray as any)
    
    // Noise Gate: Calcula RMS antes de processar
    const rms = calculateRMS(dataArray)
    
    // Atualiza volume sempre (para barra de diagnóstico) - sem throttle
    if (isMountedRef.current) {
      setVolume(rms)
    }
    
    const now = Date.now()
    const shouldUpdate = now - lastUpdateTimeRef.current >= UPDATE_INTERVAL_MS
    
    // Se o volume for muito baixo, considera como silêncio
    if (rms < RMS_THRESHOLD) {
      // Só atualiza para estado vazio se passou o throttle e tinha estado válido antes
      if (shouldUpdate && lastValidStateRef.current) {
        lastUpdateTimeRef.current = now
        setTunerState({
          note: "",
          octave: 0,
          cents: 0,
          frequency: 0,
        })
        lastValidStateRef.current = null
      }
      if (isMountedRef.current) {
        animationFrameRef.current = requestAnimationFrame(processAudio)
      }
      return
    }
    
    // Se passou o throttle, processa e atualiza
    if (shouldUpdate) {
      const sampleRate = audioContextRef.current?.sampleRate || 44100
      const frequency = autocorrelationPitch(dataArrayRef.current, sampleRate)
      
      if (!isMountedRef.current) return
      
      if (frequency > 0 && frequency < 2000) {
        const result = frequencyToNote(frequency)
        lastValidStateRef.current = result
        setTunerState(result)
      } else {
        // Frequência inválida, mas pode manter o último estado válido
        if (lastValidStateRef.current) {
          setTunerState({
            note: "",
            octave: 0,
            cents: 0,
            frequency: 0,
          })
          lastValidStateRef.current = null
        }
      }
      
      lastUpdateTimeRef.current = now
    }
    
    if (isMountedRef.current) {
      animationFrameRef.current = requestAnimationFrame(processAudio)
    }
  }, [])

  const start = useCallback(async () => {
    try {
      setError(null)
      
      // Cria AudioContext primeiro (antes de pedir permissão)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      let audioContext = audioContextRef.current
      
      if (!audioContext || audioContext.state === "closed") {
        audioContext = new AudioContextClass()
        audioContextRef.current = audioContext
      }
      
      // Resume o contexto se estiver suspenso (necessário para navegadores)
      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }
      
      // Solicita acesso ao microfone
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })
      } catch (mediaError: any) {
        let errorMessage = "Erro ao acessar microfone"
        if (mediaError.name === "NotAllowedError" || mediaError.name === "PermissionDeniedError") {
          errorMessage = "Permissão do microfone negada. Verifique as configurações do navegador."
        } else if (mediaError.name === "NotFoundError" || mediaError.name === "DevicesNotFoundError") {
          errorMessage = "Nenhum microfone encontrado."
        } else if (mediaError.name === "NotReadableError" || mediaError.name === "TrackStartError") {
          errorMessage = "Microfone já está em uso por outro aplicativo."
        } else {
          errorMessage = mediaError.message || errorMessage
        }
        setError(errorMessage)
        setIsListening(false)
        return
      }
      
      mediaStreamRef.current = stream
      
      // Garante que o contexto está rodando
      if (audioContext.state !== "running") {
        await audioContext.resume()
      }
      
      // Cria AnalyserNode
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 8192 // Maior FFT = melhor resolução em baixas frequências
      analyser.smoothingTimeConstant = 0.1 // Valor menor = mais responsivo
      analyserRef.current = analyser
      
      // Conecta microfone ao analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      // Cria buffer para dados
      const bufferLength = analyser.frequencyBinCount
      dataArrayRef.current = new Float32Array(bufferLength)
      
      setIsListening(true)
      
      // Inicia processamento
      processAudio()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao iniciar afinador"
      setError(errorMessage)
      setIsListening(false)
    }
  }, [processAudio])

  const stop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    analyserRef.current = null
    dataArrayRef.current = null
    lastValidStateRef.current = null
    lastUpdateTimeRef.current = 0
    setIsListening(false)
    setVolume(0)
    setTunerState({
      note: "",
      octave: 0,
      cents: 0,
      frequency: 0,
    })
  }, [])

  // Cleanup ao desmontar
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stop()
    }
  }, [stop])

  return {
    start,
    stop,
    isListening,
    note: tunerState.note,
    octave: tunerState.octave,
    cents: tunerState.cents,
    frequency: tunerState.frequency,
    volume,
    error,
  }
}

