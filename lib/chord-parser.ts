export interface ChordSegment {
  type: "chord"
  chord: string
  position: number // Position in the original line (character index)
}

export interface TextSegment {
  type: "text"
  text: string
  position: number
}

export type LineSegment = ChordSegment | TextSegment

export interface ParsedLine {
  type: "lyrics-only" | "chord-only" | "mixed" | "empty" | "header" | "metadata" | "other"
  originalLine: string
  segments: LineSegment[]
  leadingWhitespace: string
}

/**
 * Token visual para renderização com Flexbox
 * Combina um acorde (opcional) com o texto que ele acompanha
 */
export interface VisualToken {
  chord: string | null
  text: string
}

/**
 * Parses a ChordPro formatted text line by line
 * Identifies chords between brackets (e.g., [Am], [G#m7])
 * Preserves whitespace for proper indentation
 */
export function parseChordPro(text: string): ParsedLine[] {
  const lines = text.split("\n")
  const parsed: ParsedLine[] = []

  for (const line of lines) {
    parsed.push(parseLine(line))
  }

  return parsed
}

function parseLine(line: string): ParsedLine {
  // Preserve leading whitespace
  const leadingWhitespaceMatch = line.match(/^(\s*)/)
  const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : ""
  const trimmed = line.trim()

  // Empty line
  if (!trimmed) {
    return {
      type: "empty",
      originalLine: line,
      segments: [],
      leadingWhitespace,
    }
  }

  // Section header like [Intro], [Primeira Parte], etc. (entire line is just brackets)
  if (trimmed.match(/^\[[^\]]+\]$/) && !trimmed.includes("|")) {
    return {
      type: "header",
      originalLine: line,
      segments: [{ type: "text", text: trimmed, position: 0 }],
      leadingWhitespace,
    }
  }

  // Metadata lines like "Tom: [G]" or "Intro: [G] [C] [D]"
  if (trimmed.match(/^(Tom|Intro|Verso|Refrão|Coro):/i)) {
    return {
      type: "metadata",
      originalLine: line,
      segments: parseSegments(line),
      leadingWhitespace,
    }
  }

  // Check if line contains chords
  const hasChords = /\[[^\]]+\]/.test(line)

  if (!hasChords) {
    return {
      type: "lyrics-only",
      originalLine: line,
      segments: [{ type: "text", text: line, position: 0 }],
      leadingWhitespace,
    }
  }

  // Parse segments (chords and text)
  const segments = parseSegments(line)

  // Determine if it's chord-only, mixed, or lyrics-only
  const hasText = segments.some((s) => s.type === "text" && s.text.trim().length > 0)
  const hasChord = segments.some((s) => s.type === "chord")

  let lineType: ParsedLine["type"]
  if (hasChord && !hasText) {
    lineType = "chord-only"
  } else if (hasChord && hasText) {
    lineType = "mixed"
  } else {
    lineType = "lyrics-only"
  }

  return {
    type: lineType,
    originalLine: line,
    segments,
    leadingWhitespace,
  }
}

function parseSegments(line: string): LineSegment[] {
  const segments: LineSegment[] = []
  let i = 0
  let currentText = ""
  let textStart = i

  while (i < line.length) {
    if (line[i] === "[" && i + 1 < line.length) {
      // Save any accumulated text
      if (currentText) {
        segments.push({
          type: "text",
          text: currentText,
          position: textStart,
        })
        currentText = ""
      }

      // Find the closing bracket
      const endBracket = line.indexOf("]", i)
      if (endBracket !== -1) {
        const chord = line.substring(i + 1, endBracket)
        segments.push({
          type: "chord",
          chord,
          position: i,
        })
        i = endBracket + 1
        textStart = i
      } else {
        // No closing bracket found, treat as regular text
        currentText += line[i]
        i++
      }
    } else {
      currentText += line[i]
      i++
    }
  }

  // Add any remaining text
  if (currentText) {
    segments.push({
      type: "text",
      text: currentText,
      position: textStart,
    })
  }

  return segments
}

/**
 * Converte segments em tokens visuais (chord + text)
 * Cada token representa uma unidade visual: acorde acima do texto correspondente
 * 
 * Exemplo: "[G]Todos os dias quando [Bm]acordo"
 * Tokens:
 * - { chord: "G", text: "Todos os dias quando " }
 * - { chord: "Bm", text: "acordo" }
 */
export function segmentsToTokens(segments: LineSegment[]): VisualToken[] {
  const tokens: VisualToken[] = []
  let currentText = ""
  let currentChord: string | null = null

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment.type === "chord") {
      // Se já temos texto acumulado sem acorde, adiciona como token sem acorde
      if (currentText && currentChord === null) {
        tokens.push({ chord: null, text: currentText })
        currentText = ""
      }
      // Define o acorde atual
      currentChord = segment.chord
    } else if (segment.type === "text") {
      // Adiciona o texto ao texto atual
      currentText += segment.text

      // Se temos um acorde definido, cria um token com acorde + texto
      if (currentChord !== null) {
        tokens.push({ chord: currentChord, text: currentText })
        currentChord = null
        currentText = ""
      }
    }
  }

  // Adiciona qualquer texto restante (pode ter acorde pendente ou não)
  if (currentText || currentChord !== null) {
    tokens.push({ chord: currentChord, text: currentText || "" })
  }

  return tokens
}
