# Code Summary

## Architecture Overview

The site is a **Next.js 15 app** with a **Sanity CMS** backend. The server component (`app/page.tsx`) fetches all content at request time and passes it as props to a single client component (`components/MeadowCanvas.tsx`) that owns the canvas, all drawing logic, and all UI interactions. The Sanity Studio lives in a separate directory (`studio-lilysinnerplots/`) and is deployed independently.

---

## Sanity Studio (`studio-lilysinnerplots/`)

### `sanity.config.ts`
Registers all schema types and configures the Structure Tool to show a flat "Site Content" sidebar with five singleton entries. The `templates` filter strips the default create-new buttons so documents can only be edited, not duplicated.

### `schemaTypes/`

All five types use `__experimental_actions` to restrict available actions (create/update/delete/publish vary by type). All are queried by fixed `_id` strings matching their `_type` name, making them effectively singletons.

| File | Document type | Fields |
|---|---|---|
| `statusMessage.ts` | `statusMessage` | `message` (text, required), `updatedAt` (datetime) |
| `chairNote.ts` | `chairNote` | `message` (text, required) |
| `readingList.ts` | `readingList` | `books[]` — each: `title`, `author`, `progress` (1–5), `note`, `order` |
| `listeningList.ts` | `listeningList` | `tracks[]` — each: `title`, `source`, `note`, `order` |
| `currentProject.ts` | `currentProject` | `title`, `status` (radio: 4 options), `description`, `techStack[]`, `nextSteps`, `githubUrl`, `liveUrl` |

---

## `lib/`

### `lib/sanity.ts`
Creates the Sanity client via `createClient` from `next-sanity`, using `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` env vars. `useCdn: true` for production edge caching.

### `lib/types.ts`
TypeScript interfaces for all five content types plus the aggregate `SiteData` interface passed as a prop to `MeadowCanvas`.

| Interface | Shape |
|---|---|
| `StatusMessageData` | `{ message, updatedAt? }` |
| `ChairNoteData` | `{ message }` |
| `Book` | `{ title, author, progress, note?, order? }` |
| `ReadingListData` | `{ books: Book[] }` |
| `Track` | `{ title, source, note?, order? }` |
| `ListeningListData` | `{ tracks: Track[] }` |
| `ProjectStatus` | `'in progress' \| 'just shipped' \| 'on pause' \| 'coming soon'` |
| `CurrentProjectData` | `{ title, status, description, techStack?, nextSteps?, githubUrl?, liveUrl? }` |
| `SiteData` | All five nullable content types |

### `lib/queries.ts`
One exported async function per content type. Each calls `client.fetch` with a GROQ query, empty params, and `{ next: { revalidate: 3600 } }` for ISR. All queries filter by both `_type` and `_id` to target the singleton document. Array fields use `| order(order asc)` to respect the `order` field.

| Function | Returns |
|---|---|
| `getStatusMessage()` | `StatusMessageData \| null` |
| `getChairNote()` | `ChairNoteData \| null` |
| `getReadingList()` | `ReadingListData \| null` |
| `getListeningList()` | `ListeningListData \| null` |
| `getCurrentProject()` | `CurrentProjectData \| null` |

---

## `app/`

### `app/layout.tsx`
Root layout. Imports `globals.css`. Sets `<html lang="en">` and page metadata (`title`, `description`).

### `app/globals.css`
All styles for the site. Loaded once by the layout. Key sections:

**Reset + base** — Box-sizing reset, `overflow:hidden` on html/body, full-viewport body, Silkscreen font via `@import`.

**Canvas** — `image-rendering: pixelated/crisp-edges` to keep pixel art sharp when CSS-scaled.

**`.plot-point`** — Absolutely positioned flex column (sprite + label). Hover/focus-visible: `translateY(-6px) scale(1.08)`. Label fades in on hover. Focus ring via `:focus-visible`.

**`.scene-spot`** — Absolutely positioned transparent buttons with `min-width/height: 44px` (touch target). On hover: amber glow border + background. Contains `.ss-marker` (pulsing radial glow, `@keyframes pulseGlow`) and `.ss-label` (tooltip above).

**`#mailbox-popup`** — Dark green bordered popup, `position:absolute`, centered via `translateX(-50%)`. Opens with `@keyframes popInX`.

**`#chair-popup`** — Cream parchment popup, fixed at viewport center. Opens with `@keyframes popInXY`.

**`#overlay`** — Full-width drawer at bottom 62% of viewport. Slides up from `translateY(100%)` to `translateY(0)` with springy cubic-bezier on `.open`.

**`.tod-btn`** — Top-right grouped buttons, `min-height: 36px`, `display: inline-flex`, green active state.

**Media queries:**
- `(max-width: 600px)` — Overlay taller (78%), title wraps, TOD buttons slightly larger.
- `(max-width: 380px)` — Mailbox popup font scaled up for readability.
- `(prefers-reduced-motion: reduce)` — All transitions, animations, and the `ss-marker` pulse disabled.

### `app/page.tsx`
Server component. Calls all five query functions in a single `Promise.all`, assembles a `SiteData` object, and renders `<MeadowCanvas data={data}/>`. This is the only place data fetching happens — the canvas component receives everything as props and has no Sanity dependency.

---

## `components/MeadowCanvas.tsx`

The entire visual site. A `'use client'` component receiving `{ data: SiteData }`. Structured in two layers: module-level pure functions (all canvas drawing), and the React component itself (state, effects, event handlers, JSX).

### Module-level constants

**`PW = 384, PH = 216`** — Internal canvas resolution. All drawing uses these units; CSS scaling does the rest.

**`C`** — Color palette object: cloud tones, meadow greens, stream blues, path browns, flower colors, tree greens, trunk browns, wood/rope colors, sun yellow.

**`TOD`** — Type alias: `'day' | 'dusk' | 'night'`.

**`BOOK_ICONS`, `TRACK_ICONS`** — Emoji arrays cycled by index when rendering Sanity book/track lists (replaces hardcoded icons).

**`stars[]`** — 55 pre-computed `[x, y, size]` positions, deterministically generated.

**`fflies[]`** — 16 pre-computed `[x, y, index]` firefly positions.

**`flowers[]`** — 36 pre-placed wildflower `[x, y, color, stemHeight]` entries in two foreground clusters, avoiding the stream.

### Module-level geometry helpers

**`streamX(py)`** — Cubic bezier giving the stream's x-position at canvas row `py`. Meanders left of center: x≈146 at horizon, control point x≈118, x≈112 at foreground.

**`streamW(py)`** — Stream width at row `py`. Grows 3px → 19px for foreshortening.

**`lerp(a, b, t)`** — Hex color interpolation across all three channels. Used for sky gradients and meadow transitions.

**`getMood(tod)`** — Returns a mood object `{ skyT, skyM, skyH, tint, cel, mtn, stars, fireflies, clouds }` for the given TOD. Drives every color decision in the draw pipeline.

### Module-level draw functions

All accept `ctx: CanvasRenderingContext2D` as their first argument (no module-level canvas state).

**`px(ctx, x, y, w, h, c)`** — One-liner fillStyle + fillRect helper used throughout.

**`drawSky(ctx, tick, tod)`** — Row-by-row sky gradient. Animates star twinkle from `tick`. Calls `drawCelestial`. Places 5 clouds if `getMood.clouds`.

**`drawCelestial(ctx, M)`** — Branches on `M.cel`: pixel sun (top-left, day), large gradient disc with glow halo (center-right, dusk), crater-marked moon disc (top-left, night).

**`drawCloud(ctx, x, y, w, h)`** — Single cloud: shadow layer + highlight layer + puffy top caps.

**`drawMountains(ctx, tod)`** — Five triangle silhouettes in `getMood(tod).mtn` color with semi-transparent snow caps.

**`drawDistantMeadow(ctx)`** — Gradient strip y 60–80, then 8 tiny 2px horizon flower dots.

**`drawDistantTrees(ctx)`** — Five small pine shapes on the right side of the far distance.

**`drawMidMeadow(ctx)`** — Gradient strip y 78–130 with sine-wave stipple grass texture.

**`drawStream(ctx, wf)`** — Stream from horizon to foreground. Per row: dark bank pixels, tricolor water gradient, animated foam sparkle from `wf`, river rocks every 11px below y=90.

**`drawForegroundGrass(ctx)`** — Gradient base fill y 128–216, then layered pixel grass blades (three-pixel clumps in `fgLt/fgVlt/fgMd`, spacing grows with y). Skips within 6px of stream.

**`drawCottWindow(ctx, cxW, topY, night)`** — Single cottage window: frame, sill, pane (blue day / golden night), cross dividers, specular highlight stripe.

**`drawCottage(ctx, tod)`** — Main scene building (cx=205). Renders in order: shadow, clapboard walls with siding, shingle roof (4-shade per-row pattern), attic window, chimney + smoke, two side windows via `drawCottWindow`, flower box, pink door with panels and knob, stone steps, 9 climbing rose positions, sunflower pot.

**`leafBlob(ctx, x, y, w, h)`** — Elliptical leaf mass. Fills pixels within ellipse using position-modulo color selection across `leafDk/leafMd/leafLt`. Adds `leafHi` highlights. Bounds-clamps to prevent out-of-range writes.

**`drawForegroundTree(ctx)`** — Large left-edge tree. Trunk drawn row-by-row (sinusoidal curve, widening with y). Horizontal branch at y≈56–68 (swing attachment). Seven `leafBlob` calls for the canopy.

**`drawSwing(ctx)`** — Rope swing hanging from the tree branch: two ropes, top rail, 6 alternating seat slats, seat board, armrests, forward legs, shadow.

**`drawWildflower(ctx, x, y, col, h)`** — 1px stem, 4-pixel cross petals, 1px yellow center.

**`drawPath(ctx)`** — Dirt path y=158 to foreground, centered ~x=192. Width grows with depth, sine wobble, alternating dark/light rows.

**`drawTint(ctx, tod)`** — Semi-transparent color fill over the entire canvas if `getMood(tod).tint` is set.

**`drawFireflies(ctx, tick)`** — 16 fireflies in Lissajous oscillation, blinking on/off from `tick` modulo. 1px core + 4 dim glow pixels each.

**`drawVignette(ctx)`** — Darkens left/right 8px edges by column, plus dark strip at bottom.

**`draw(ctx, wf, tick, tod)`** — Master draw call. Correct back-to-front order: sky → mountains → distant meadow → distant trees → mid meadow → stream → foreground grass → cottage → wildflowers → foreground tree → swing → path → tint → fireflies → vignette.

### Module-level sprites

**`sprites`** — Object of canvas-painting functions, one per plot-point icon. Each receives its `<canvas>` and draws using `fillRect` calls:
- `scroll` — Rolled parchment with red wax seal (Substack)
- `lantern` — Hanging lantern with glowing interior (GitHub)
- `mailbox` — Red mailbox with flag up (working-on)
- `basket` — Woven basket with flowers and produce (cooking)
- `books` — Stack of three colored books with bookmarks (reading)
- `music` — Vinyl record with red label and musical note sparks (music)

**`paintSprites()`** — Queries all `.pp-sprite` canvases, reads `data-sprite`, calls the matching sprite function. Called once in a mount effect.

### Module-level layout

**`plotPos`** — Position config for 6 plot points: `{ b: bottom%, l: left%, sc: scale }`.

**`spotPos`** — Position config for 2 scene spots: `{ cx: left%, cyB: bottom%, w%, h% }`.

**`positionAll()`** — Computes absolute pixel positions for all plot points and scene spots from their percentage configs. Sprite display size = `nativeWidth × spriteScale × sc` where `spriteScale` is `2.7` (desktop) / `2.2` (tablet <768px) / `1.8` (mobile <480px). Called on mount and resize.

### React component: state and refs

| Ref | Purpose |
|---|---|
| `canvasRef` | The `<canvas>` element |
| `todRef` | Current TOD for the RAF loop (kept in sync with `timeOfDay` state) |
| `tickRef` | Animation tick counter, incremented each RAF frame |
| `rafRef` | Current `requestAnimationFrame` handle for cancellation |
| `mailboxBtnRef` | Mailbox button — used for popup positioning and focus return |
| `mailboxPopupRef` | Mailbox popup — used for imperative position setting |
| `mpCloseRef` | Mailbox close button — focused on open |
| `chairBtnRef` | Chair button — focus return on close |
| `cpCloseRef` | Chair close button — focused on open |
| `overlayRef` | Overlay div — used for focus trap |
| `overlayCloseRef` | Overlay close button — focused on open |
| `overlayTriggerRef` | Stores the element that opened the overlay for focus return |

| State | Purpose |
|---|---|
| `timeOfDay` | Current TOD (`'day' \| 'dusk' \| 'night'`) — drives button active state |
| `mailboxOpen` | Whether the mailbox popup is visible |
| `chairOpen` | Whether the chair popup is visible |
| `overlayType` | Which overlay is open (`'reading' \| 'listening' \| 'project' \| null`) |

### React component: effects

**Canvas setup + animation loop** (`[]`) — Gets the 2D context, sets `imageSmoothingEnabled = false`. Defines `loop()` (increments `tickRef`, calls `draw(ctx, wf, tick, todRef.current)`, schedules next RAF) and `startLoop()` (cancels existing RAF, skips loop if `prefers-reduced-motion`). Adds/removes a `visibilitychange` listener to pause/resume on tab hide. Cleans up RAF on unmount.

**TOD ref sync** (`[timeOfDay]`) — Keeps `todRef.current` in sync so the RAF loop sees state changes without restarting.

**Auto-TOD on mount** (`[]`) — Reads `new Date().getHours()` and sets initial TOD: night (20–5), dusk (18–19), day (6–17).

**Sprites + layout** (`[]`) — Calls `paintSprites()` and `positionAll()` after first render.

**Resize handler** (`[mailboxOpen]`) — Calls `positionAll()` on resize; if mailbox is open, also calls `positionMailboxPopup()` to re-clamp.

**Global Escape key** (`[overlayType, mailboxOpen, chairOpen, ...]`) — Priority order: close overlay → close mailbox with focus return → close chair with focus return.

**Outside-click close** (`[mailboxOpen, chairOpen, ...]`) — Closes the relevant popup if a click lands outside both its trigger and its container. Does not move focus (user clicked elsewhere intentionally).

### React component: handlers

**`positionMailboxPopup()`** — Reads `mailboxBtnRef` bounding rect, clamps horizontal position to `min(210, viewportWidth-20)`, positions popup above the button.

**`openMailbox()` / `closeMailbox()` / `closeMailboxFocus()`** — Open: closes overlay/chair, opens popup, sets `aria-expanded`, focuses close button. Close: hides popup, clears `aria-expanded`. CloseWithFocus: close + return focus to trigger.

**`handleMailboxToggle()`** — Toggles between `openMailbox` and `closeMailboxFocus`.

**`openChair()` / `closeChair()` / `closeChairFocus()`** — Same pattern as mailbox.

**`handleChairToggle()`** — Toggles between `openChair` and `closeChairFocus`.

**`openOverlay(type, trigger)`** — Closes both popups, stores trigger ref, sets `overlayType`, focuses close button.

**`closeOverlay()`** — Clears `overlayType`, returns focus to stored trigger.

**`handleOverlayKeyDown(e)`** — Focus trap: on Tab/Shift-Tab, wraps focus between first and last focusable elements inside `overlayRef`.

**`handleTOD(tod)`** — Sets both `todRef.current` and `timeOfDay` state.

### React component: render helpers

**`renderMailboxBody()`** — Splits `data.statusMessage.message` on `\n`, renders each non-empty line prefixed with `▶`. Falls back to hardcoded text if no Sanity document.

**`renderOverlayContent()`** — Branches on `overlayType`:
- `'reading'` — Maps `data.readingList.books` to `.list-item` rows. Icon cycled from `BOOK_ICONS` by index. Progress bar rendered as 5 `.pb-seg` divs.
- `'listening'` — Maps `data.listeningList.tracks` to `.list-item` rows. Icon cycled from `TRACK_ICONS`.
- `'project'` — Renders project card from `data.currentProject`: status tag, title, description, tech stack line, next steps line, GitHub link if present.

**`overlayTitle()`** — Returns the overlay header string for the current `overlayType`.

**`renderChairBody()`** — (inline in JSX) Splits `data.chairNote.message` on `\n` and renders with `<br/>` between lines. Falls back to original hardcoded note if no Sanity document published.

---

## `index.html` (archived)

The original V1.2 vanilla HTML/CSS/JS implementation. Kept at the repo root as a reference of the pre-Next.js state. All logic described above exists here as imperative JS with module-level variables instead of React state and refs.

## `InnerPlotsV1.2/indexv1.1.html` (archived)

The V1.1 implementation: Teletubbies-style mound house, stream centered rather than left-side, no foreground tree or swing, no scene spots, no cottage.
