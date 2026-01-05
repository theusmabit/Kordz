"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useLiveQuery } from "dexie-react-hooks"
import { Search } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { db, type Song } from "@/lib/db-local"
import { cn } from "@/lib/utils"

export function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const songs = useLiveQuery(() => db.songs.toArray(), [])

  const filteredSongs = React.useMemo(() => {
    if (!songs || !searchValue.trim()) return []
    const query = searchValue.toLowerCase()
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    )
  }, [songs, searchValue])

  const showResults = open && searchValue.trim().length > 0

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleSelect = (song: Song) => {
    router.push(`/song/${song.slug}`)
    setSearchValue("")
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Command
        shouldFilter={false}
        className={cn(
          "rounded-lg border bg-background",
          showResults && "border-b-0 rounded-b-none overflow-visible"
        )}
      >
        <div className="flex h-9 items-center gap-2 px-3 border-b">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar músicas, artistas..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setOpen(true)}
            className="flex h-full w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {showResults && (
          <div className="absolute top-full left-0 right-0 z-50 mt-[-1px]">
            <CommandList
              className={cn(
                "border rounded-b-lg",
                "bg-popover shadow-md",
                "max-h-[300px] overflow-y-auto"
              )}
            >
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              {filteredSongs.length > 0 && (
                <CommandGroup heading="Músicas">
                  {filteredSongs.map((song) => (
                    <CommandItem
                      key={song.id}
                      value={`${song.title} ${song.artist}`}
                      onSelect={() => handleSelect(song)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-medium truncate">{song.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {song.artist}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  )
}

