"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db-local"
import { SongHeader } from "./song-header"
import { ChordRenderer } from "./chord-renderer"
import { SidebarTools } from "./sidebar-tools"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface SongDataLoaderProps {
  slug: string
}

export function SongDataLoader({ slug }: SongDataLoaderProps) {
  const song = useLiveQuery(
    () => db.songs.where("slug").equals(slug).first(),
    [slug]
  )

  if (song === undefined) {
    return (
      <div className="w-full max-w-full grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] items-start px-4 lg:px-6">
        <main className="min-h-screen py-6 lg:py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="mt-8 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <aside className="sticky top-24 hidden h-[calc(100vh-6rem)] w-full flex-col gap-4 border-l pl-6 lg:flex">
          <Skeleton className="h-64 w-full" />
        </aside>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="w-full max-w-full grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] items-start px-4 lg:px-6">
        <main className="min-h-screen py-6 lg:py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Música não encontrada</h2>
              <p className="text-muted-foreground">
                A música que você está procurando não existe ou foi removida.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const displayContent = song.key
    ? `Tom: [${song.key}]\n${song.content}`
    : song.content

  return (
    <div className="w-full max-w-full grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] items-start px-4 lg:px-6">
      {/* Main Content Area */}
      <main className="min-h-screen py-6 lg:py-8">
        <SongHeader
          title={song.title}
          artist={song.artist}
          slug={song.slug}
          song={song}
          isFavorite={song.isFavorite ?? false}
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

