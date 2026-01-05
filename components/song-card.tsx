import Link from "next/link"
import { Music, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SongCardProps {
  title: string
  artist: string
  coverUrl?: string
  slug?: string
  className?: string
  isFavorite?: boolean
}

export function SongCard({
  title,
  artist,
  coverUrl,
  slug = "#",
  className,
  isFavorite = false,
}: SongCardProps) {
  return (
    <Link href={slug} className={cn("block", className)}>
      <Card className="group cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-md p-0 relative">
        {isFavorite && (
          <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-1.5">
            <Heart className="h-3.5 w-3.5 text-primary fill-primary" />
          </div>
        )}
        <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Capa de ${title}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music className="h-12 w-12 text-primary/40" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-foreground line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{artist}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

