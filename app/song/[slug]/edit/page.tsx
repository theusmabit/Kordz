"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChordRenderer } from "@/components/player/chord-renderer";
import { db } from "@/lib/db-local";
import { generateSlug } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface EditSongPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EditSongPage({ params }: EditSongPageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("");
  const [content, setContent] = useState("");

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  // Load song data
  const song = useLiveQuery(
    () => (slug ? db.songs.where("slug").equals(slug).first() : undefined),
    [slug]
  );

  // Populate form when song loads
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setKey(song.key || "");
      setContent(song.content);
    }
  }, [song]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    if (!song?.id) {
      toast.error("Música não encontrada");
      return;
    }

    try {
      const newSlug = generateSlug(title);
      const now = new Date();

      await db.songs.update(song.id, {
        title: title.trim(),
        artist: artist.trim() || "Desconhecido",
        content: content.trim(),
        key: key.trim(),
        slug: newSlug,
        updatedAt: now,
      });

      toast.success("Música atualizada com sucesso!");
      router.push(`/song/${newSlug}`);
    } catch (error) {
      console.error("Erro ao atualizar música:", error);
      toast.error("Erro ao atualizar música. Tente novamente.");
    }
  };

  // Formata o conteúdo para o preview (adiciona o Tom se especificado)
  const previewContent = key
    ? `Tom: [${key}]\n${content}`
    : content;

  if (!slug) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (song === undefined) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Música não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              A música que você está tentando editar não existe ou foi removida.
            </p>
            <Button onClick={() => router.push("/")}>Voltar para Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Música</h1>
        <p className="text-muted-foreground mt-2">
          Edite a cifra e veja a pré-visualização em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna da Esquerda - Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Música</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Bohemian Rhapsody"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artista</Label>
              <Input
                id="artist"
                placeholder="Ex: Queen"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Tom</Label>
              <Input
                id="key"
                placeholder="Ex: C, G, Am, etc."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full max-w-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo da Cifra</Label>
              <Textarea
                id="content"
                placeholder={`Exemplo:
Tom: [C]
[C]Essa é uma [F]música teste
[G]Com acordes [Am]formatados`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="font-mono h-[500px]"
              />
            </div>

            <Button onClick={handleSave} className="w-full" size="lg">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Coluna da Direita - Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[500px] p-4 bg-muted/30 rounded-lg">
              {previewContent ? (
                <ChordRenderer content={previewContent} />
              ) : (
                <p className="text-muted-foreground text-center py-20">
                  Digite a cifra na coluna da esquerda para ver a pré-visualização
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

