# `index.html` — Code Summary

## HTML Structure

**`<head>`**
Loads Silkscreen font from Google Fonts; sets viewport meta for responsive scaling; contains the entire `<style>` block.

**`#scene`**
Full-viewport root container (`100vw × 100vh`). Everything is absolutely positioned inside it.

| Element | Role |
|---|---|
| `canvas#meadow` | The pixel art canvas (`384×216` internal, CSS-scaled to fill viewport via `image-rendering: pixelated`) |
| `#title` | Heading "lily's inner plots" + subtitle. Pointer-events disabled (decorative overlay). |
| `.plot-point` × 6 | Interactive links/buttons over canvas landmarks. IDs: `pp-github`, `pp-substack`, `pp-cooking`, `pp-reading`, `pp-music`, `pp-mailbox`. |
| `.scene-spot` × 2 | Transparent hotspot buttons over scene geometry. IDs: `ss-chair` (foreground swing area), `ss-door` (cottage door). |
| `#mailbox-popup` | Small green terminal-style dialog for "what I'm working on". `role="dialog"`, `aria-modal`. |
| `#chair-popup` | Cream/parchment centered dialog for an encouraging note. `role="dialog"`, `aria-modal`. |
| `#overlay` | Bottom-sheet drawer for list content (reading, listening, project). `role="dialog"`, `aria-modal`, `aria-labelledby`. |
| `#tod-toggle` | Three-button time-of-day toggle (day/dusk/night). `role="group"`, `aria-pressed` on each button. |
| `#footer` | Static "tended by lily" credit, bottom-left. |

---

## CSS Sections

**Reset + base** — Box-sizing reset, `overflow:hidden` on html/body, full-viewport body.

**Canvas** — `image-rendering: pixelated/crisp-edges` to keep pixel art sharp when scaled.

**`.plot-point`** — Absolutely positioned flex column (sprite + label). Hover/focus-visible: `translateY(-6px) scale(1.08)`. Label fades in on hover. Focus ring via `:focus-visible`.

**`.scene-spot`** — Absolutely positioned transparent buttons with `min-width/height: 44px` (touch target). On hover: amber glow border + background. Contains a `.ss-marker` (pulsing radial glow dot, `@keyframes pulseGlow`) and `.ss-label` (tooltip that appears above).

**`#mailbox-popup`** — Dark green bordered popup, `position:absolute`, uses `transform: translateX(-50%)` for horizontal centering. Shows with `@keyframes popInX` (scale + fade). `.mp-close` has `min-height: 32px` and `:focus-visible` ring.

**`#chair-popup`** — Cream parchment popup, fixed at viewport center via `top:46%; left:50%; transform: translate(-50%,-50%)`. Shows with `@keyframes popInXY`. `.cp-close` same pattern as above.

**`#overlay`** — Full-width drawer fixed to the bottom 62% of viewport. Hidden via `translateY(100%)`, slides up to `translateY(0)` on `.open` with a springy cubic-bezier. Contains `.list-item`, `.progress-bar`, `.project-card` sub-styles.

**`#tod-toggle` / `.tod-btn`** — Top-right fixed position. Buttons `min-height: 36px`, `display: inline-flex`. Active state highlighted green.

**`#footer`** — Absolutely positioned, `clamp()` font size, `pointer-events: none`.

**Media queries:**
- `(max-width: 600px)` — Overlay taller (78%), title wraps (removes `white-space: nowrap`), TOD buttons slightly larger.
- `(max-width: 380px)` — Mailbox popup font scales up slightly for readability.
- `(prefers-reduced-motion: reduce)` — Disables all transitions, animations, and `ss-marker` pulse.

---

## JavaScript — Constants & State

**`PW = 384, PH = 216`** — Internal canvas resolution. All drawing uses these units; CSS scaling does the rest.

**`px(x, y, w, h, c)`** — Micro-helper: `fillStyle = c; fillRect(x, y, w, h)`. Used for shorthand rect drawing throughout.

**`C` (color palette)** — Single object holding every named color used in drawing functions: cloud tones, meadow greens, stream blues, path browns, flower colors, tree greens, trunk browns, wood/rope colors, sun yellow.

**`timeOfDay`** — Global string, one of `'day'`, `'dusk'`, `'night'`. Drives all sky/tint/celestial/mountain color decisions.

**`getMood(tod)`** — Returns a mood object for the given time of day:
- `skyT/skyM/skyH` — Sky gradient colors (top, middle, horizon)
- `tint` — Optional color overlay string (`rgba(...)`)
- `cel` — Celestial body type: `'sun'`, `'dusksun'`, `'moon'`
- `mtn` — Mountain silhouette color
- `stars`, `fireflies`, `clouds` — Boolean flags

**`stars[]`** — 55 pre-computed `[x, y, size]` positions for the night sky, deterministically generated from index arithmetic.

**`fflies[]`** — 16 pre-computed `[x, y, index]` positions for firefly base coordinates.

**`flowers[]`** — 36 pre-placed wildflower `[x, y, color, stemHeight]` entries. Two clusters: left foreground (x 24–116) and right foreground (x 238–378), avoiding the stream and the path.

---

## JavaScript — Geometry Helpers

**`streamX(py)`** — Cubic bezier curve giving the stream's x-position at canvas row `py`. Meanders LEFT of center: x≈146 at the horizon (py=60), curves through a control point near x=118, widens back to x≈112 at the foreground bottom.

**`streamW(py)`** — Stream width at row `py`. Grows from 3px at the horizon to 19px at the bottom, simulating foreshortening perspective.

**`lerp(a, b, t)`** — Hex color interpolation. Parses two `#rrggbb` strings and linearly interpolates each channel. Used for sky gradients and meadow color transitions.

---

## JavaScript — Draw Functions

**`drawSky(tick)`** — Draws the sky gradient row-by-row (lerp from top to middle, then middle to horizon). If `stars` flag: animates star twinkle using `tick`. Calls `drawCelestial`. If `clouds` flag: places 5 clouds at fixed positions.

**`drawCelestial(M)`** — Branches on `M.cel`:
- `'sun'` — Small pixel sun at top-left with radiating rays
- `'dusksun'` — Larger circular sun at center-right (`cx=212, cy=46`), gradient filled with amber glow halo
- `'moon'` — Disc at `cx=42, cy=22` with grey crater markings

**`drawCloud(x, y, w, h)`** — Draws a single rounded pixel cloud using layered rects: shadow layer, highlight layer, puffy top caps.

**`drawMountains()`** — Five mountain silhouettes, each a triangle of pixels using `getMood(timeOfDay).mtn` color. Snow cap drawn as a semi-transparent white stripe at the peak.

**`drawDistantMeadow()`** — Horizontal gradient strip (y 60–80), then 8 tiny 2px flower dots along the horizon line.

**`drawDistantTrees()`** — Five small pine tree shapes in the far distance (right side). Each: trunk (2px), dark body, lighter top.

**`drawMidMeadow()`** — Gradient strip (y 78–130). Adds a stipple grass texture via sine-wave scattered `midLt` pixels.

**`drawStream(wf)`** — Draws the stream from horizon to foreground. Per row: bank pixels on each side (dark green), stream pixels with tricolor water gradient (dark edges, mid and bright center), animated foam sparkle using `wf` (wave frame), rocks on alternating rows every 11px below y=90.

**`drawForegroundGrass()`** — Base gradient fill (y 128–216), then layered pixel grass blades: three adjacent pixels per clump in `fgLt`, `fgVlt`, `fgMd`, spaced by `spacing` (grows with y for perspective). Grass is skipped within 6px of the stream.

**`drawCottWindow(cxW, topY, night)`** — Draws a single cottage window: frame, sill, pane (blue in day, golden `#FFE08A` at night), cross dividers, and a specular highlight stripe. Used twice in `drawCottage`.

**`drawCottage()`** — The main scene building (center-right, cx=205). Renders in layers:
1. Clapboard walls with siding lines every 3px and gradient shading (lighter left, darker right)
2. Shingle roof (apex y=99, eave y=128), row-by-row with 4-shade repeating shingle pattern
3. Attic window: golden glow at night, steel blue by day
4. Chimney (right of apex) with smoke puffs above (opacity reduced at night)
5. Two side windows via `drawCottWindow`
6. Flower box under left window with 5 colored stems
7. Pink door (left of center) with panels, frame, and gold doorknob
8. Stone steps below door
9. Climbing rose vines around wall edges (9 rose positions)
10. Sunflower pot to the right of the door

**`leafBlob(x, y, w, h)`** — Draws a single elliptical leaf mass. Iterates all pixels within the ellipse and fills with random-ish `leafDk/leafMd/leafLt` colors based on position modulo. Highlights one-in-three pixels on a lighter shade. Bounds-clamps to prevent out-of-range canvas writes.

**`drawForegroundTree()`** — Large tree at the left edge. Trunk drawn row-by-row: centers around x=20, curves sinusoidally, widens from top to bottom. A horizontal branch sweeps right at y≈56–68 (the swing attachment point). Seven `leafBlob` calls cover the canopy, overlapping into the sky.

**`drawSwing()`** — Rope swing hanging from the tree branch. Two vertical ropes (`ax=64, bx=92`), a top rail, 6 alternating-color seat slats, a seat board, two armrests, two forward legs with a shadow.

**`drawWildflower(x, y, col, h)`** — Single tiny flower: 1px stem, 4-pixel cross petals in `col`, 1px yellow center.

**`drawPath()`** — A dirt path from y=158 to the foreground, centered around x=192. Width grows with depth. Alternating dark/light rows with darker edge pixels. Slight sine wave wobble.

**`drawTint()`** — If the current mood has a `tint`, fills the entire canvas with a semi-transparent color overlay (blue-indigo at night, warm amber at dusk).

**`drawFireflies(tick)`** — Animates 16 fireflies. Each oscillates in an x/y Lissajous pattern derived from `tick` + per-firefly seed. Blinks on/off using `tick` modulo. Draws a 1px core with 4 surrounding dim glow pixels.

**`drawVignette()`** — Darkens the left 8px and right 8px edges column-by-column with increasing opacity, plus a dark strip at the very bottom.

**`draw(wf, tick)`** — Master draw call. Calls all draw functions in correct back-to-front order: sky → mountains → distant meadow → distant trees → mid meadow → stream → foreground grass → cottage → wildflowers → foreground tree → swing → path → tint → fireflies → vignette.

---

## JavaScript — Sprites

**`sprites` object** — One function per plot-point icon, each receiving its `<canvas>` element and drawing directly into it with `fillRect` calls:
- `scroll` — Rolled parchment with red wax seal (Substack)
- `lantern` — Hanging lantern with glowing interior (GitHub)
- `mailbox` — Red mailbox with flag up (working-on)
- `basket` — Woven basket with flowers and produce (cooking)
- `books` — Stack of three colored books with bookmarks (reading)
- `music` — Vinyl record with red label and musical note sparks (music)

**`paintSprites()`** — Queries all `.pp-sprite` canvases, reads their `data-sprite` attribute, and calls the matching sprite function.

---

## JavaScript — Layout

**`plotPos`** — Position config for the 6 plot points: `{b: bottom%, l: left%, sc: scale}`. Percentages are applied to `window.innerWidth/Height`.

**`spotPos`** — Position config for the 2 scene spots: `{cx: left%, cyB: bottom%, w: width%, h: height%}`. Applied as CSS percentages.

**`positionAll()`** — Called on load and on `resize`. Computes absolute pixel positions for all plot points and scene spots from their percentage configs. Also sets sprite display size: `nativeWidth × spriteScale × sc`, where `spriteScale` is `2.7` (desktop) / `2.2` (tablet, <768px) / `1.8` (mobile, <480px).

---

## JavaScript — Popup: Mailbox

**`positionPopup()`** — Reads the mailbox button's `getBoundingClientRect`, horizontally centers the popup over it, clamps position so it never overflows viewport edges (accounts for `popW = min(210, viewportWidth-20)`), positions it above the button using `bottom = window.innerHeight - r.top + 10`.

**`openMailbox()`** — Closes any open overlay and chair popup, positions and opens the mailbox popup, sets `aria-expanded="true"` on the trigger, focuses the close button.

**`closeMailbox()`** — Removes `open` class, sets `aria-expanded="false"`. Does not move focus (for outside-click dismissal).

**`closeMailboxFocus()`** — Calls `closeMailbox()` then returns focus to `mailboxBtn` (for close-button click and Escape key).

Mailbox button click handler: toggles between `openMailbox()` and `closeMailboxFocus()`.

---

## JavaScript — Popup: Chair

**`openChair()`** — Closes overlay and mailbox popup, adds `open` class to chair popup, sets `aria-expanded="true"`, focuses the close button.

**`closeChair()`** — Removes `open` class, sets `aria-expanded="false"`. No focus move (for outside-click).

**`closeChairFocus()`** — Calls `closeChair()` then returns focus to `chairBtn`.

Chair button click handler: toggles between `closeChairFocus()` and `openChair()`.

**Outside-click handler** (`document click`) — If a click lands outside both the trigger and popup, dismisses that popup via the non-focusing close variant.

---

## JavaScript — Overlay (Content Drawer)

**`readingList[]`** — Array of 3 book objects: `{icon, title, sub, note, progress (1–5)}`.

**`listeningList[]`** — Array of 4 music/podcast objects: `{icon, title, sub, note}`.

**`overlayTrigger`** — Stores the element that opened the overlay, so focus can be returned on close.

**`openOverlay(type, triggerEl)`** — Closes both popups (via `closeMailbox`/`closeChair`), stores the trigger element, renders the appropriate content into `#overlay-content` as HTML, adds `open` class to slide the drawer up, focuses the close button. Types: `'reading'`, `'listening'`, `'project'`.

**`closeOverlay()`** — Removes `open` class, returns focus to `overlayTrigger`, clears the trigger reference.

**Focus trap** (`overlay keydown`) — On Tab/Shift-Tab: queries all focusable elements inside the overlay, wraps focus from last→first (Tab) or first→last (Shift+Tab).

**Escape key handler** (`document keydown`) — Priority order: if overlay open → `closeOverlay()`; else if mailbox open → `closeMailboxFocus()`; else if chair open → `closeChairFocus()`.

---

## JavaScript — Time of Day

**TOD button click handler** — Sets `timeOfDay` to the clicked button's `data-tod`, updates `active` class and `aria-pressed` on all three buttons.

**`autoTOD()` (IIFE)** — Runs once on load. Reads `new Date().getHours()` and sets the initial TOD: `night` (20:00–05:59), `dusk` (18:00–19:59), `day` (06:00–17:59). Updates button states accordingly.

---

## JavaScript — Animation Loop

**`reduced`** — Boolean from `matchMedia('prefers-reduced-motion: reduce')`. If true, draws a single static frame and never starts the loop.

**`loop()`** — Increments `tick` by `0.16` each frame, calls `draw(Math.floor(tick) % 6, tick)`, schedules the next frame via `requestAnimationFrame`.

**`startLoop()`** — Cancels any existing RAF, then either draws a single static frame (reduced motion) or starts `loop()`.

**`visibilitychange` handler** — Pauses the RAF when the tab is hidden, restarts via `startLoop()` when visible again.

**`resize` handler** — Calls `positionAll()` to recompute all element positions; if the mailbox popup is open, also calls `positionPopup()` to re-clamp its position.

**Boot sequence** (last line) — `positionAll()` → `paintSprites()` → `startLoop()`.
