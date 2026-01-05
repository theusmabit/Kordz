// lib/music-theory.ts

export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// A4 = 440Hz (padrão internacional)
const A4_FREQUENCY = 440;
const A4_NOTE_NUMBER = 69; // MIDI note number para A4

/**
 * Converte frequência em Hz para número de nota MIDI
 * Fórmula: noteNum = 12 * log2(freq / 440) + 69
 */
export function frequencyToNoteNumber(frequency: number): number {
  if (frequency <= 0) return 0;
  return 12 * Math.log2(frequency / A4_FREQUENCY) + A4_NOTE_NUMBER;
}

/**
 * Converte número de nota MIDI para frequência em Hz
 */
export function noteNumberToFrequency(noteNumber: number): number {
  return A4_FREQUENCY * Math.pow(2, (noteNumber - A4_NOTE_NUMBER) / 12);
}

/**
 * Converte frequência em Hz para nota cromática, oitava e cents
 * Retorna: { note, octave, cents, frequency }
 */
export function frequencyToNote(frequency: number): {
  note: string;
  octave: number;
  cents: number;
  frequency: number;
} {
  if (frequency <= 0) {
    return { note: "", octave: 0, cents: 0, frequency: 0 };
  }

  const noteNumber = frequencyToNoteNumber(frequency);
  const roundedNoteNumber = Math.round(noteNumber);
  const semitone = roundedNoteNumber % 12;
  const octave = Math.floor(roundedNoteNumber / 12) - 1; // Ajuste para oitava correta
  
  const note = NOTES[semitone < 0 ? semitone + 12 : semitone];
  const targetFrequency = noteNumberToFrequency(roundedNoteNumber);
  
  // Calcula cents: 1200 * log2(freq / targetFreq)
  const cents = 1200 * Math.log2(frequency / targetFrequency);
  
  return {
    note,
    octave,
    cents: Math.round(cents * 10) / 10, // Arredonda para 1 casa decimal
    frequency: Math.round(frequency * 10) / 10,
  };
}

/**
 * Normaliza notas para sustenidos (ex: Db -> C#) para facilitar o cálculo
 */
function normalizeNote(note: string): string {
  const map: Record<string, string> = {
    "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#",
    "Cb": "B", "Fb": "E", "B#": "C", "E#": "F"
  };
  return map[note] || note;
}

export function formatTransposition(semitones: number): string {
  if (semitones === 0) return "Original";
  return semitones > 0 ? `+${semitones}` : `${semitones}`;
}

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;

  // Regex para separar a nota base (ex: "C") do resto (ex: "m7")
  // Captura: (Nota)(Sustenido/Bemol opcional)(Resto)
  const regex = /^([A-G])([#b]?)(.*)$/;
  const match = chord.match(regex);

  if (!match) return chord; // Se não for um acorde reconhecível, retorna igual

  const [, base, accidental, suffix] = match;
  let note = normalizeNote(base + accidental);
  
  // Acha o índice da nota na escala
  let index = NOTES.indexOf(note);
  if (index === -1) return chord;

  // Calcula nova posição (lidando com números negativos e voltas na array)
  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return NOTES[newIndex] + suffix;
}

/**
 * Simplifica um acorde removendo extensões complexas, mantendo apenas a tríade básica
 * Exemplos:
 * - Am7 -> Am
 * - Gmaj7 -> G
 * - D/F# -> D (remove baixo invertido)
 * - Cadd9 -> C
 * - F#m7(b5) -> F#m
 */
export function simplifyChord(chord: string): string {
  // Remove baixo invertido (ex: D/F# -> D)
  const slashIndex = chord.indexOf("/");
  if (slashIndex !== -1) {
    chord = chord.substring(0, slashIndex);
  }

  // Regex para capturar: (Nota)(Sustenido/Bemol opcional)(Qualidade menor opcional)(Resto)
  // Exemplos: "Am7" -> ["Am7", "A", "", "m", "7"]
  //           "Gmaj7" -> ["Gmaj7", "G", "", "", "maj7"]
  //           "F#m7(b5)" -> ["F#m7(b5)", "F", "#", "m", "7(b5)"]
  const regex = /^([A-G])([#b]?)(m?)(.*)$/;
  const match = chord.match(regex);

  if (!match) return chord; // Se não for um acorde reconhecível, retorna igual

  const [, base, accidental, quality] = match;
  
  // Retorna apenas a raiz + qualidade básica (m para menor, nada para maior)
  return base + accidental + quality;
}