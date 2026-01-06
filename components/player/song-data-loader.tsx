"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db, type Song as LocalSong } from "@/lib/db-local"
import { SongHeader } from "./song-header"
import { ChordRenderer } from "./chord-renderer"
import { SidebarTools } from "./sidebar-tools"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface SupabaseSong {
  id: string
  title: string
  artist: string
  content: string
  key: string | null
  slug: string
  created_at: string
  updated_at: string
  is_favorite?: boolean
}

interface SongDataLoaderProps {
  song: SupabaseSong
}

export function SongDataLoader({ song }: SongDataLoaderProps) {
  // Busca a versão local (Dexie) para funcionalidades offline como favoritos
  const localSong = useLiveQuery(
    () => db.songs.where("slug").equals(song.slug).first(),
    [song.slug]
  )

  // Converte o formato do Supabase para o formato esperado pelos componentes
  const displayContent = song.key
    ? `Tom: [${song.key}]\n${song.content}`
    : song.content

  // Usa o favorito local se existir, senão usa o do Supabase
  const isFavorite = localSong?.isFavorite ?? song.is_favorite ?? false

  // Cria um objeto song compatível para o SongHeader (que ainda pode usar Dexie para algumas operações)
  const songForHeader: LocalSong | undefined = localSong || {
    id: undefined,
    title: song.title,
    artist: song.artist,
    content: song.content,
    key: song.key || "",
    slug: song.slug,
    createdAt: new Date(song.created_at),
    updatedAt: new Date(song.updated_at),
    isFavorite: isFavorite,
  }

  return (
    <div className="w-full max-w-full grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] items-start px-4 lg:px-6">
      {/* Main Content Area */}
      <main className="min-h-screen py-6 lg:py-8">
        <SongHeader
          title={song.title}
          artist={song.artist}
          slug={song.slug}
          song={songForHeader}
          isFavorite={isFavorite}
        />

        {/* Chord Content */}
        <div className="mt-8">
          {displayContent ? (
            <ChordRenderer content={displayContent} />
          ) : (
            <div className="font-mono text-foreground">
              <p className="text-muted-foreground">Nenhum conteúdo disponível</p>
            </div>
          )}
        </div>
      </main>

      {/* Sidebar Tools - Desktop Only */}
      <aside className="sticky top-24 hidden h-[calc(100vh-6rem)] w-full flex-col gap-4 border-l pl-6 lg:flex overflow-y-auto">
        <SidebarTools />
      </aside>
    </div>
  )
}

