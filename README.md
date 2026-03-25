<p align="center">
  <img src="app/icon.svg" width="64" height="64" alt="Flash Cards logo" />
</p>

<h1 align="center">Flash Cards</h1>

<p align="center">
  A flashcard app for drilling vocabulary. Polish to English, Polish to German, geography.
  <br />
  Whatever you throw into the data file.
  <br />
  <a href="https://snc-cards.vercel.app">snc-cards.vercel.app</a>
</p>

---

## What is this

I built this to help myself study vocabulary. You see a word, try to recall the translation, flip the card, and mark if you got it right. There's also a spelling mode where you type the answer letter by letter.

Everything runs in the browser. No accounts, no backend, no tracking. Your progress is saved locally in IndexedDB so you can pick up where you left off.

## Features

- **Flashcards** - flip cards with keyboard or tap. Mark correct/wrong. Tracks your streak
- **Spelling mode** - type the answer character by character. Forces you to actually know it
- **List view** - browse all Q&A pairs in a topic at once
- **Score history** - charts showing how you've done over time, stored locally
- **Session resume** - close the tab mid-session, come back later, pick up where you stopped
- **Fuzzy search** - `Cmd+K` / `Ctrl+K` to quickly jump between topics
- **Keyboard-first** - Enter to flip, Enter/Backspace for correct/wrong, Ctrl+Z to undo
- **Interactive tutorial** - a "How It Works" section on the home page with playable demo cards

## Running locally

You need [Bun](https://bun.sh) installed.

```bash
bun install
bun run dev
```

Opens at [localhost:3000](http://localhost:3000).

For a production build:

```bash
bun run build
bun run start
```

## Adding your own topics

All the data lives in `data/topics.json`. The format is straightforward:

```json
{
  "id": "1",
  "title": "Common Greetings",
  "slug": "common-greetings",
  "class": "en",
  "questions": [
    { "id": 1, "question": "Dzień dobry", "answer": "Good morning" },
    { "id": 2, "question": "Do widzenia", "answer": "Goodbye" }
  ]
}
```

The `class` field controls the color theme: `en` for English (blue), `de` for German (peach/orange), `geo` for geography (green).

## Tech stack

- **Next.js 16** with App Router and React Server Components
- **React 19** + TypeScript
- **Tailwind CSS v4**
- **motion/react** for animations (card flips, page transitions, spring physics)
- **Dexie** for IndexedDB storage (sessions, score history)
- **Recharts** for score history charts
- **fuse.js** for fuzzy search
- **Bun** as the package manager and runtime

Deployed on **Vercel**.

## License

MIT
