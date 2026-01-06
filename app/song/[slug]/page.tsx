import { SongPageClient } from "@/components/player/song-page-client"
import { SongDataLoader } from "@/components/player/song-data-loader"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"

interface SongPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function SongPage({ params }: SongPageProps) {
  const { slug } = await params

  // Busca a música no Supabase
  const { data: song, error } = await supabase
    .from('songs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !song) {
    notFound()
  }

  return (
    <>
      <SongPageClient />
      <SongDataLoader song={song} />
    </>
  )
}

