import { SongPageClient } from "@/components/player/song-page-client"
import { SongDataLoader } from "@/components/player/song-data-loader"

interface SongPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function SongPage({ params }: SongPageProps) {
  const { slug } = await params

  return (
    <>
      <SongPageClient />
      <SongDataLoader slug={slug} />
    </>
  )
}

