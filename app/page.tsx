"use client"

import { SongCard } from "@/components/song-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db-local"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

export default function Home() {
  const [greeting, setGreeting] = useState("Bom dia")
  
  const recentSongs = useLiveQuery(
    () => db.songs.orderBy("updatedAt").reverse().limit(4).toArray(),
    []
  )
  
  const favoriteSongs = useLiveQuery(
    () => db.songs.filter((song) => song.isFavorite === true).toArray(),
    []
  )

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  const hasAnySongs = (recentSongs?.length ?? 0) > 0 || (favoriteSongs?.length ?? 0) > 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Saudação */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, Músico
        </h1>
        <p className="text-muted-foreground mt-1">
          Continue de onde parou ou explore novas músicas
        </p>
      </div>

      {/* Empty State */}
      {!hasAnySongs && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem músicas salvas
            </p>
            <Link href="/song/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira música
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Seção 1: Favoritos */}
      {favoriteSongs && favoriteSongs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            ⭐ Seus Favoritos
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {favoriteSongs.map((song) => (
              <SongCard
                key={song.id}
                title={song.title}
                artist={song.artist}
                slug={`/song/${song.slug}`}
                isFavorite={song.isFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Seção 2: Recentes */}
      {recentSongs && recentSongs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            🕒 Continuar Tocando
          </h2>
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {recentSongs.map((song) => (
                <SongCard
                  key={song.id}
                  title={song.title}
                  artist={song.artist}
                  slug={`/song/${song.slug}`}
                  className="w-[200px] flex-shrink-0"
                  isFavorite={song.isFavorite}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}
    </div>
  )
}
