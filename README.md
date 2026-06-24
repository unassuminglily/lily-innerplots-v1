# lily's inner plots

A personal landing page that is also a world.

Instead of a grid of links, this is a hand-drawn pixel meadow — a place you can wander through. Every link lives somewhere in the scene: a lantern for GitHub, a scroll for Substack, a basket for the cooking account. A cottage sits in the middle distance. A rope swing hangs from a foreground tree. A stream cuts across the left side of the field.

## What it is

A single self-contained HTML file. No frameworks, no build step, no dependencies beyond a Google Font. The entire scene is drawn at runtime on a `384×216` canvas using only `fillRect` calls, then CSS-scaled to fill the viewport with pixel-perfect rendering.

## What's in the scene

- **Foreground tree + swing** on the left, where a scene-spot button lets you sit a while and read a note
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
| Swing spot (`ss-chair`) | Opens a small encouraging note popup |
| Cottage door (`ss-door`) | Opens the current project overlay |
| Mailbox sprite | Opens a "what I'm working on" popup above it |
| Reading list / Listening list | Open a bottom-sheet drawer with books and music |
| Time of day toggle | Switches between day, dusk, and night — changes sky colors, celestial body, mountain tones, and enables stars/fireflies |

The time of day is set automatically from the system clock on load.

## Technical notes

- **Canvas rendering** — All scene art is procedural `fillRect` at 1px granularity. No images or SVGs. The canvas is `384×216` internally and scaled to `100vw × 100vh` via CSS `image-rendering: pixelated`.
- **Animation** — `requestAnimationFrame` loop with a `tick` counter drives stream foam, star twinkle, firefly Lissajous movement, and cloud positions. Pauses automatically when the tab is hidden. Stops entirely if `prefers-reduced-motion` is set.
- **Sprites** — Each plot-point icon is a small `<canvas>` element painted by a dedicated sprite function using `fillRect`. Six sprites total, all pixel-native.
- **Responsive layout** — Plot points and scene spots are positioned by percentage of the viewport, recalculated on `resize`. Sprite scale steps down on tablet and mobile. Touch targets meet the 44px minimum.
- **Accessibility** — All dialogs use `role="dialog"` and `aria-modal`. Toggle buttons have `aria-expanded` and `aria-pressed`. The overlay has a Tab focus trap. Escape closes the topmost open dialog and returns focus to its trigger. `:focus-visible` outlines on all interactive elements.

## Files

| File | Description |
|---|---|
| `index.html` | The entire site — HTML, CSS, and JS in one file |
| `InnerPlotsV1.2/indexv1.1.html` | Archived V1.1 (Teletubbies mound, centered stream, no cottage) |
| `CODE_SUMMARY.md` | Full technical reference: every function, section, and CSS rule documented |

## Stack

HTML · CSS · Canvas API · Silkscreen (Google Fonts)

No build tools. No frameworks. Open `index.html` in a browser and it runs.
