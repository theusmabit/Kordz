"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChordRenderer } from "@/components/player/chord-renderer";
import { db } from "@/lib/db-local";
import { generateSlug } from "@/lib/utils";
import { toast } from "sonner";

export default function CreateSongPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("");
  const [content, setContent] = useState("");

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    try {
      const slug = generateSlug(title);
      const now = new Date();

      await db.songs.add({
        title: title.trim(),
        artist: artist.trim() || "Desconhecido",
        content: content.trim(),
        key: key.trim(),
        slug,
        createdAt: now,
        updatedAt: now,
      });

      toast.success("Música salva com sucesso!");
      router.push(`/song/${slug}`);
    } catch (error) {
      console.error("Erro ao salvar música:", error);
      toast.error("Erro ao salvar música. Tente novamente.");
    }
  };

  // Formata o conteúdo para o preview (adiciona o Tom se especificado)
  const previewContent = key
    ? `Tom: [${key}]\n${content}`
    : content;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Criar Nova Música</h1>
        <p className="text-muted-foreground mt-2">
          Digite a cifra e veja a pré-visualização em tempo real
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
              Salvar Música
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

