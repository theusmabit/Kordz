export function generateSlug(artist: string, title: string): string {
    // Combina artista e título
    const text = `${artist}-${title}`;
  
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD") // Separa acentos das letras (ex: 'é' vira 'e' + '´')
      .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
      .replace(/[^a-z0-9 -]/g, "") // Remove caracteres especiais (apenas letras, números e hífens)
      .replace(/\s+/g, "-") // Substitui espaços por hífens
      .replace(/-+/g, "-") // Remove hífens duplicados
      .replace(/^-+/, "") // Remove hífen do começo
      .replace(/-+$/, ""); // Remove hífen do fim
  }
  
  // Exemplo de uso:
  // generateSlug("Legião Urbana", "Tempo Perdido")
  // Resultado: "legiao-urbana-tempo-perdido"