"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, type Setlist } from "@/lib/db-local"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Music } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SetlistsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const setlists = useLiveQuery(() => db.setlists.orderBy("createdAt").reverse().toArray(), [])

  const handleCreateSetlist = async () => {
    if (!name.trim()) {
      toast.error("Nome do setlist é obrigatório")
      return
    }

    try {
      await db.setlists.add({
        name: name.trim(),
        description: description.trim() || undefined,
        songIds: [],
        createdAt: new Date(),
      })

      toast.success("Setlist criado com sucesso!")
      setIsDialogOpen(false)
      setName("")
      setDescription("")
    } catch (error) {
      console.error("Erro ao criar setlist:", error)
      toast.error("Erro ao criar setlist. Tente novamente.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Setlists</h1>
          <p className="text-muted-foreground mt-1">
            Organize seu repertório de shows
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Setlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Setlist</DialogTitle>
              <DialogDescription>
                Crie um novo setlist para organizar suas músicas para um show específico.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Casamento Ana & João"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição opcional do setlist..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSetlist}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!setlists || setlists.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Você ainda não tem setlists criados
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro setlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {setlists.map((setlist) => (
            <Link key={setlist.id} href={`/setlists/${setlist.id}`}>
              <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{setlist.name}</CardTitle>
                  {setlist.description && (
                    <CardDescription className="line-clamp-2">
                      {setlist.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {setlist.songIds.length} {setlist.songIds.length === 1 ? "música" : "músicas"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

