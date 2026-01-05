import Link from "next/link"
import { Folder } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PlaylistCardProps {
  name: string
  songCount: number
  slug?: string
  className?: string
}

export function PlaylistCard({
  name,
  songCount,
  slug = "#",
  className,
}: PlaylistCardProps) {
  return (
    <Link href={slug} className={cn("block", className)}>
      <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
          <div className="rounded-lg bg-primary/10 p-6 transition-colors group-hover:bg-primary/20">
            <Folder className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {songCount} {songCount === 1 ? "música" : "músicas"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

