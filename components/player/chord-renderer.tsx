"use client";

import React, { useMemo } from "react";
import { parseChordPro } from "@/lib/chord-parser";
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

      // Se for bloco de letra + acorde (O mais comum)
      if (line.type === "mixed") {
        return (
          <div key={lineIndex} className="relative mb-6 leading-[3rem] whitespace-pre-wrap">
            {line.segments.map((seg, segIdx) => {
              if (seg.type === "chord") {
                // Processamento: 1. Transposição, 2. Simplificação (se ativada)
                let processed = transposeChord(seg.chord, transposition);
                if (isSimplified) {
                  processed = simplifyChord(processed);
                }
                
                // Renderiza o acorde flutuando acima da letra
                return (
                  <span key={segIdx} className="relative inline-block">
                    <span 
                      className="absolute -top-6 left-0 font-bold text-primary select-none"
                      aria-hidden="true"
                    >
                      {processed}
                    </span>
                    <span className="text-foreground">{" "}</span>
                  </span>
                );
              }
              // Apenas letra
              if (seg.type === "text") {
                return <span key={segIdx} className="text-foreground">{seg.text}</span>;
              }
              return null;
            })}
          </div>
        );
      }

      return null;
    });
  }, [parsedLines, transposition, isSimplified]); // Dependências: texto, transposição e simplificação

  return (
    <div 
      className="font-mono w-full select-text"
      style={{ fontSize: `${effectiveFontSize}px` }}
    >
      {renderedContent}
    </div>
  );
}