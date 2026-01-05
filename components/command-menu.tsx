"use client"

import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command"

interface SearchCommandProps {
  children: React.ReactNode
}

export function SearchCommand({ children }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            onClick: () => setOpen(true),
          })
        : children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar músicas, artistas ou pastas..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Músicas">
            {/* Músicas aparecerão aqui */}
          </CommandGroup>
          <CommandGroup heading="Artistas">
            {/* Artistas aparecerão aqui */}
          </CommandGroup>
          <CommandGroup heading="Pastas">
            {/* Pastas aparecerão aqui */}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

