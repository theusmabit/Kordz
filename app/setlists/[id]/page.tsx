"use client"

import { useEffect, useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { useRouter } from "next/navigation"
import { db, type Setlist, type Song } from "@/lib/db-local"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Music, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { SongCard } from "@/components/song-card"

interface SetlistDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function SetlistDetailPage({ params }: SetlistDetailPageProps) {
  const router = useRouter()
  const [id, setId] = useState<number | null>(null)

  useEffect(() => {
    params.then((resolvedParams) => {
      const parsedId = parseInt(resolvedParams.id, 10)
      if (!isNaN(parsedId)) {
        setId(parsedId)
      }
    })
  }, [params])

  const setlist = useLiveQuery(
    () => (id ? db.setlists.get(id) : undefined),
    [id]
  )

  const songs = useLiveQuery(async () => {
    if (!setlist?.songIds || setlist.songIds.length === 0) {
      return []
    }
    // Mantém a ordem do array songIds
    const allSongs = await db.songs.where("id").anyOf(setlist.songIds).toArray()
    // Ordena conforme a ordem em songIds
    return setlist.songIds
      .map((songId) => allSongs.find((s) => s.id === songId))
      .filter((s): s is Song => s !== undefined)
  }, [setlist])

  const handleRemoveSong = async (songId: number) => {
    if (!setlist?.id) return

    try {
      const updatedSongIds = setlist.songIds.filter((id) => id !== songId)
      await db.setlists.update(setlist.id, {
        songIds: updatedSongIds,
      })
      toast.success("Música removida do setlist")
    } catch (error) {
      console.error("Erro ao remover música:", error)
      toast.error("Erro ao remover música. Tente novamente.")
    }
  }

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!setlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/setlists">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
        </Link>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Setlist não encontrado</p>
            <Link href="/setlists">
              <Button variant="outline" className="mt-4">
                Voltar para Setlists
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isEmpty = !songs || songs.length === 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/setlists">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">{setlist.name}</h1>
          {setlist.description && (
            <p className="text-muted-foreground mt-1">{setlist.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {songs?.length || 0} {songs?.length === 1 ? "música" : "músicas"}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Este setlist está vazio
            </p>
            <p className="text-sm text-muted-foreground">
              Adicione músicas a este setlist através da página da cifra
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {songs.map((song) => (
            <div key={song.id} className="relative group">
              <SongCard
                title={song.title}
                artist={song.artist}
                slug={`/song/${song.slug}`}
                isFavorite={song.isFavorite}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remover do setlist</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover música do setlist?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A música "{song.title}" será removida deste setlist, mas não será excluída.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => song.id && handleRemoveSong(song.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

