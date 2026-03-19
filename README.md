# snc-cards v2

A flashcard demo app built with the modern web stack. Showcases card flip animations, spelling mode, and fuzzy search — all statically generated.

## Stack

- **Next.js 16** (App Router, React Server Components)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v4** (CSS-first configuration)
- **motion/react** (formerly framer-motion)
- **Bun** (package manager + runtime)

## Getting Started

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
bun run build
bun run start
```

## Features

- **Cards Mode**: Flip-card study with keyboard navigation and streak tracking
- **Spelling Mode**: Type-the-answer with per-character masked inputs
- **List View**: Browse all Q&A pairs with duplicate detection
- **Search**: Fuzzy search with Cmd+K (Mac) / Ctrl+K (Windows) shortcut

## Demo Data

All data is local (`data/topics.json`) — no backend required. Topics cover English phrases, German vocabulary, and European capitals.
