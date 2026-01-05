"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ArrowLeft, Heart, Pencil, Trash, Plus, ListMusic } from "lucide-react"
import { db, type Song, type Setlist } from "@/lib/db-local"
import { toast } from "sonner"

interface SongHeaderProps {
  title: string
  artist: string
  slug: string
  song?: Song
  isFavorite?: boolean
  onFavoriteToggle?: () => void
}

export function SongHeader({
  title,
  artist,
  slug,
  song,
  isFavorite = false,
  onFavoriteToggle,
}: SongHeaderProps) {
  const router = useRouter()
  const [isAddToSetlistOpen, setIsAddToSetlistOpen] = useState(false)

  const setlists = useLiveQuery(() => db.setlists.orderBy("createdAt").reverse().toArray(), [])

  const handleFavoriteToggle = async () => {
    if (!song?.id) {
      toast.error("Música não encontrada");
      return;
    }

    try {
      const newFavoriteStatus = !isFavorite;
      await db.songs.update(song.id, { isFavorite: newFavoriteStatus });
      
      if (newFavoriteStatus) {
        toast.success("Adicionado aos favoritos");
      } else {
        toast.success("Removido dos favoritos");
      }

      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
      toast.error("Erro ao atualizar favorito. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    if (!song?.id) {
      toast.error("Música não encontrada");
      return;
    }

    try {
      await db.songs.delete(song.id);
      toast.success("Música excluída com sucesso!");
      router.push("/");
    } catch (error) {
      console.error("Erro ao excluir música:", error);
      toast.error("Erro ao excluir música. Tente novamente.");
    }
  };

  const handleAddToSetlist = async (setlist: Setlist) => {
    if (!song?.id || !setlist.id) {
      toast.error("Música ou setlist não encontrado");
      return;
    }

    try {
      // Verifica se a música já está no setlist
      if (setlist.songIds.includes(song.id)) {
        toast.info("Esta música já está no setlist");
        setIsAddToSetlistOpen(false);
        return;
      }

      // Adiciona o ID da música ao array songIds
      await db.setlists.update(setlist.id, {
        songIds: [...setlist.songIds, song.id],
      });

      toast.success(`Música adicionada ao setlist ${setlist.name}`);
      setIsAddToSetlistOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar música ao setlist:", error);
      toast.error("Erro ao adicionar música ao setlist. Tente novamente.");
    }
  };

  return (
    <div className="flex items-center gap-4 pb-6 border-b">
      <Link href="/">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
      </Link>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
        <p className="text-muted-foreground text-sm truncate">{artist}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/song/${slug}/edit`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        </Link>
        <Dialog open={isAddToSetlistOpen} onOpenChange={setIsAddToSetlistOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ListMusic className="h-4 w-4" />
              <span className="sr-only">Adicionar ao Setlist</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar ao Setlist</DialogTitle>
              <DialogDescription>
                Selecione um setlist para adicionar esta música.
              </DialogDescription>
            </DialogHeader>
            {!setlists || setlists.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Você ainda não tem setlists criados
                </p>
                <Link href="/setlists">
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Setlist
                  </Button>
                </Link>
              </div>
            ) : (
              <Command>
                <CommandInput placeholder="Buscar setlist..." />
                <CommandList>
                  <CommandEmpty>Nenhum setlist encontrado.</CommandEmpty>
                  <CommandGroup>
                    {setlists.map((setlist) => (
                      <CommandItem
                        key={setlist.id}
                        onSelect={() => handleAddToSetlist(setlist)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium">{setlist.name}</span>
                          {setlist.description && (
                            <span className="text-xs text-muted-foreground truncate">
                              {setlist.description}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {setlist.songIds.length}{" "}
                            {setlist.songIds.length === 1 ? "música" : "músicas"}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Trash className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir música?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A música "{title}" será
                permanentemente excluída.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteToggle}
          className="h-9 w-9"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground"
            }`}
          />
          <span className="sr-only">Favoritar</span>
        </Button>
      </div>
    </div>
  )
}

