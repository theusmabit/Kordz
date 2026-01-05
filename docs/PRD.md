# 📄 PROJETO: CleanCifra (PRD + Design System)
**Versão:** 1.0 (Final Desktop-First)

## 1. Visão Geral
Uma aplicação web (PWA) de cifras e tablaturas focada na experiência do músico. O diferencial é a utilidade, performance e precisão.
O sistema é **"Desktop-First"** (layout rico para telas grandes com sidebars fixas), mas totalmente responsivo. Prioriza uma experiência **"Local-First"** (Cache sob Demanda) para garantir funcionamento offline em palcos e viagens.

## 2. Design System & Tech Specs
*Esta seção orienta a implementação visual e as bibliotecas obrigatórias.*

* **Biblioteca UI:** **shadcn/ui** (Baseada em Radix UI + Tailwind CSS).
* **Ícones:** **Lucide React** (Estilo outline, traço fino).
* **Tipografia:**
    * **UI Geral:** `Geist Sans` (Moderna, geométrica).
    * **Cifras (CRÍTICO):** `Geist Mono` ou `JetBrains Mono`. O alinhamento vertical entre acorde e letra deve ser perfeito.
* **Paleta de Cores (Tailwind):**
    * **Light-Mode First:** A interface padrão é clara.
    * **Cores Semânticas:**
        * `bg-background` (Branco ou Slate-50)
        * `text-foreground` (Slate-900)
        * `text-primary` (Emerald-600 ou Indigo-600) para **Acordes** e **Botões de Ação**.
        * `text-muted-foreground` (Slate-500) para letras de músicas e metadados.

## 3. Princípios de UX (Comportamento)
1.  **Desktop-First:** No PC/Tablet, a sidebar de ferramentas é **FIXA** à direita. Não esconda ferramentas em menus se houver espaço na tela.
2.  **Zen Mode:** O foco é a cifra. Elementos de navegação global podem ser minimizados durante a execução.
3.  **Cache Sob Demanda:** O app não baixa o banco de dados inteiro. Apenas músicas salvas em **Playlists** ou **Favoritos** são persistidas no IndexedDB.

## 4. Funcionalidades Core (Player de Cifra)
A página da música (`/song/[slug]`) é o coração do app.

* **Layout (Grid Assimétrico):**
    * **Desktop:** Área da Cifra (75%) + Sidebar Fixa (25%).
    * **Mobile:** Área da Cifra (100%) + Menu Flutuante/Sheet.
* **Renderização:**
    * Parser de formato *ChordPro*.
    * Sistema de colunas dinâmico (1, 2 ou 3 colunas) via CSS Grid.
* **Sidebar de Ferramentas (Direita):**
    * **Navegador de Playlist (Topo):** Botões `< Anterior` e `Próxima >`.
    * **Transposição:** Botões `-` e `+` (Tom).
    * **Simplificador:** Switch para limpar acordes complexos.
    * **Auto-Scroll:** Slider de velocidade.
    * **Utilitários:** Botões para abrir Modais de Afinador e Metrônomo.
    * **Player Sticky:** Player do YouTube minimizado no rodapé da sidebar.

## 5. Navegação & Performance (Palco)
Funcionalidades para operação "Mãos Livres".

* **Atalhos de Teclado (Global Listener):**
    * `ArrowRight`: Próxima música da playlist.
    * `ArrowLeft`: Música anterior.
    * `Space`: Play/Pause Auto-scroll.
    * **Guardrail:** Atalhos NÃO funcionam se o usuário estiver digitando em inputs.
* **Estrofe Skipper:** Atalhos para pular blocos de texto verticalmente.

## 6. Gestão de Conteúdo
* **Playlists:** Criação de pastas (tags) e ordenação manual.
* **Favoritos:** Sistema de "Like" que dispara o download offline automático.
* **Busca:** Command Palette (`Ctrl+K`) que busca Músicas, Artistas e Pastas.
* **Crowdsourcing:** Formulário para envio de cifras (Status: Pending -> Approved).

## 7. Arquitetura Offline
* **Tecnologia:** Service Workers + IndexedDB (**Dexie.js**).
* **Lógica de Sync:**
    * **Ao abrir música:** Tenta buscar no Dexie (Local). Se não achar, busca no Supabase (Remote).
    * **Ao Favoritar:** Baixa o JSON da música e salva no Dexie.
    * **Status:** Indicador visual discreto de "Offline" ou "Sincronizado".