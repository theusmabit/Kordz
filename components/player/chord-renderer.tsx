"use client";

import React, { useMemo } from "react";
import { parseChordPro, segmentsToTokens } from "@/lib/chord-parser";
import { usePlayerStore } from "@/stores/player-store";
import { transposeChord, simplifyChord } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

interface ChordRendererProps {
  content: string;
  fontSize?: number;
  showTabs?: boolean;
}

export function ChordRenderer({ content, fontSize, showTabs = true }: ChordRendererProps) {
  // Conecta com a Store Global
  const { transposition, fontSize: storeFontSize, isSimplified } = usePlayerStore();
  
  // Decide qual tamanho de fonte usar (prop ou store)
  const effectiveFontSize = fontSize ?? storeFontSize;

  // 1. Parsing do texto (só refaz se o texto mudar)
  const parsedLines = useMemo(() => parseChordPro(content), [content]);

  // 2. Renderização (Refaz se o texto OU a transposição mudarem)
  const renderedContent = useMemo(() => {
    return parsedLines.map((line, lineIndex) => {
      // Se for linha vazia
      if (line.type === "empty") {
        return <div key={lineIndex} className="h-4" />;
      }

      // Se for linha de metadados (ex: Tom: [G])
      if (line.type === "metadata") {
        return (
          <div key={lineIndex} className="text-muted-foreground font-semibold mb-2">
            {line.segments.map((seg, segIdx) => {
              if (seg.type === "chord") {
                let processed = transposeChord(seg.chord, transposition);
                if (isSimplified) {
                  processed = simplifyChord(processed);
                }
                return <span key={segIdx} className="text-primary">{processed} </span>;
              }
              if (seg.type === "text") {
                return <span key={segIdx}>{seg.text}</span>;
              }
              return null;
            })}
          </div>
        );
      }

      // Se for bloco de letra + acorde (O mais comum) - usa tokenização visual
      if (line.type === "mixed") {
        const tokens = segmentsToTokens(line.segments);
        
        return (
          <div 
            key={lineIndex} 
            className="flex flex-wrap mb-6"
          >
            {tokens.map((token, tokenIdx) => {
              // Processa o acorde se existir
              let processedChord: string | null = null;
              if (token.chord) {
                processedChord = transposeChord(token.chord, transposition);
                if (isSimplified) {
                  processedChord = simplifyChord(processedChord);
                }
              }

              return (
                <div 
                  key={tokenIdx} 
                  className="flex flex-col"
                >
                  {/* Acorde (altura fixa para manter alinhamento) */}
                  <div className="h-6 flex items-start">
                    {processedChord && (
                      <span className="font-mono font-bold text-primary select-none">
                        {processedChord}
                      </span>
                    )}
                  </div>
                  {/* Texto (preserva espaços) */}
                  <span className="font-mono text-foreground whitespace-pre">
                    {token.text}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      // Linha apenas com letra (sem acordes)
      if (line.type === "lyrics-only") {
        return (
          <div 
            key={lineIndex} 
            className="mb-6"
          >
            <div className="flex flex-wrap">
              <div className="flex flex-col">
                <div className="h-6" />
                <span className="font-mono text-foreground whitespace-pre">
                  {line.originalLine}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // Linha apenas com acordes (sem letra)
      if (line.type === "chord-only") {
        return (
          <div 
            key={lineIndex} 
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {line.segments.map((seg, segIdx) => {
                if (seg.type === "chord") {
                  let processed = transposeChord(seg.chord, transposition);
                  if (isSimplified) {
                    processed = simplifyChord(processed);
                  }
                  return (
                    <span key={segIdx} className="font-mono font-bold text-primary">
                      {processed}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        );
      }

      return null;
    });
  }, [parsedLines, transposition, isSimplified, effectiveFontSize]); // Dependências: texto, transposição, simplificação e tamanho da fonte

  return (
    <div 
      className="font-mono w-full select-text"
      style={{ fontSize: `${effectiveFontSize}px` }}
    >
      {renderedContent}
    </div>
  );
}