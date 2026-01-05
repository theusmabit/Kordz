"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4 px-4">
        {/* Logo - Esquerda */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-xl font-bold text-foreground">Kordz</span>
        </Link>

        {/* Busca - Centro */}
        <div className="flex-1 max-w-xl mx-auto">
          <SearchBar />
        </div>

        {/* Navegação e Usuário - Direita */}
        <div className="flex items-center gap-4 shrink-0">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Início
            </Link>
            <Link
              href="/setlists"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Setlists
            </Link>
            <Link
              href="/favorites"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Favoritos
            </Link>
          </nav>
          {/* Placeholder para botão de usuário/perfil */}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <span className="sr-only">Perfil</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

