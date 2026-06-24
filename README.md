# lily's inner plots

A personal landing page that is also a world.

Instead of a grid of links, this is a hand-drawn pixel meadow — a place you can wander through. Every link lives somewhere in the scene: a lantern for GitHub, a scroll for Substack, a basket for the cooking account. A cottage sits in the middle distance. A rope swing hangs from a foreground tree. A stream cuts across the left side of the field.

## What it is

A Next.js app backed by Sanity CMS. The entire scene is drawn at runtime on a `384×216` HTML canvas using only `fillRect` calls, then CSS-scaled to fill the viewport with pixel-perfect rendering. All editable content — the mailbox message, the chair note, reading list, listening list, and current project — is managed through Sanity Studio and served via GROQ queries with hourly ISR revalidation.

## What's in the scene

- **Foreground tree + swing** on the left — click to sit a while and read a note from the chair
- **A stream** that meanders down the left side, widening toward the foreground with animated foam
- **A cottage** center-right with a shingle roof, flower boxes, climbing roses, glowing windows at night, and a door you can click to see the current project
- **Wildflower clusters** scattered around the stream banks
- **A dirt path** leading toward the cottage
- **Mountains** in the far distance, color-shifted by time of day
- **6 plot-point sprites** — pixel-art icons (lantern, scroll, basket, books, vinyl record, mailbox) floating over their corresponding landmarks, each linking to a real URL or opening a content drawer

## Interactions

| Element | What it does |
|---|---|
| Plot points (sprites) | Hover to see label; click to follow link or open overlay |
| Swing spot (`ss-chair`) | Opens the chair note popup — content from Sanity |
| Cottage door (`ss-door`) | Opens the current project overlay — content from Sanity |
| Mailbox sprite | Opens the "what I'm working on" popup — content from Sanity |
| Reading list / Listening list | Open a bottom-sheet drawer — content from Sanity |
| Time of day toggle | Switches between day, dusk, and night — changes sky colors, celestial body, mountain tones, and enables stars/fireflies |

The time of day is set automatically from the system clock on load.

## Technical notes

- **Canvas rendering** — All scene art is procedural `fillRect` at 1px granularity. No images or SVGs. The canvas is `384×216` internally and scaled to `100vw × 100vh` via CSS `image-rendering: pixelated`.
- **Animation** — `requestAnimationFrame` loop with a `tick` counter drives stream foam, star twinkle, firefly Lissajous movement, and cloud positions. Pauses automatically when the tab is hidden. Stops entirely if `prefers-reduced-motion` is set.
- **Sprites** — Each plot-point icon is a small `<canvas>` element painted by a dedicated sprite function using `fillRect`. Six sprites total, all pixel-native.
- **Responsive layout** — Plot points and scene spots are positioned by percentage of the viewport, recalculated on `resize`. Sprite scale steps down on tablet and mobile. Touch targets meet the 44px minimum.
- **Accessibility** — All dialogs use `role="dialog"` and `aria-modal`. Toggle buttons have `aria-expanded` and `aria-pressed`. The overlay has a Tab focus trap. Escape closes the topmost open dialog and returns focus to its trigger. `:focus-visible` outlines on all interactive elements.
- **CMS** — Sanity content is fetched server-side in `app/page.tsx` via parallel `Promise.all`, typed with TypeScript interfaces in `lib/types.ts`, and revalidated every 3600 seconds in production. The canvas client component receives all data as props.

## Content managed in Sanity

| Document | What it controls |
|---|---|
| Status Message | Text in the mailbox popup |
| Chair Note | Text in the "sit a while" popup |
| Reading List | Books shown in the reading list overlay |
| Listening List | Music and podcasts in the listening overlay |
| Current Project | Project card shown when clicking the cottage door |

All five are singletons — one document per type, no create/delete in Studio.

## File structure

```
VibingProjects/
├── app/
│   ├── globals.css          # All styles
│   ├── layout.tsx           # Root layout, font import, metadata
│   └── page.tsx             # Server component — fetches Sanity data, renders MeadowCanvas
├── components/
│   └── MeadowCanvas.tsx     # Client component — all canvas drawing, sprites, popups, interactions
├── lib/
│   ├── sanity.ts            # Sanity client (next-sanity)
│   ├── types.ts             # TypeScript interfaces for all five content types
│   └── queries.ts           # GROQ queries, one per content type
├── studio-lilysinnerplots/  # Sanity Studio (separate app, deployed independently)
│   └── schemaTypes/
│       ├── statusMessage.ts
│       ├── chairNote.ts
│       ├── readingList.ts
│       ├── listeningList.ts
│       └── currentProject.ts
├── InnerPlotsV1.2/
│   └── indexv1.1.html       # Archived V1.1 (vanilla HTML, no CMS)
├── index.html               # Archived V1.2 (vanilla HTML, pre-Next.js migration)
├── .env.local.example       # Required env vars template
└── CODE_SUMMARY.md          # Full technical reference
```

## Local development

```bash
# Site (Next.js)
npm install
cp .env.local.example .env.local   # fill in Sanity project ID + dataset
npm run dev                         # http://localhost:3000

# Studio (Sanity)
cd studio-lilysinnerplots
npm run dev                         # http://localhost:3333
```

## Stack

Next.js 15 · React 19 · TypeScript · Canvas API · Sanity CMS · next-sanity · Silkscreen (Google Fonts)
