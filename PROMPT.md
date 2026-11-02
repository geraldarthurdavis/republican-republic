# One-Shot Development Prompt — *Sea to Shining Sea*

> Paste everything below the line into a coding agent (Claude Code or similar) opened at the root of this repository. It is written to be executed in a single pass.

---

## Role

You are a senior design engineer finishing a production political website. The project is already scaffolded, builds cleanly, and renders. **Extend it — do not rebuild it, swap frameworks, or restyle the established design system.** Read every file in `src/`, `scripts/`, and this prompt before changing anything.

## What this site is

A pro-Republican, educational, click-through presentation of the White House release *“President Trump’s Second Term: Promises Made, Promises Kept, Results Delivered”* (127 promises, 25 sections). Visitors travel **“from sea to shining sea”** across 13 regional chapters — each a place in America paired with the policy sections that belong to it — then arrive at a civic call to action. A parallel `/record` page holds every promise as plain, linkable, printable text.

**Tone:** temperate, elegant, confident. The *site’s own voice* (epigraphs, UI copy, chapter intros) is calm and dignified — an imperial-republic museum, not a rally. Quoted promise/result text is reproduced **verbatim**; never edit, soften, or amplify a quote.

## Stack (versions verified 2026‑11‑02 — do not downgrade)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Astro 7.4** (`output: "static"`) | Zero client framework. Vanilla TS modules in `src/scripts/`. |
| Styling | **Tailwind CSS 4.3** via `@tailwindcss/vite` + hand-authored scoped CSS | Tokens live in `@theme` in `src/styles/global.css`. Prefer tokens over raw hex. |
| Motion | **GSAP 3.15** (all plugins free since 3.13) — `SplitText` in use; `Flip`, `DrawSVGPlugin`, `MorphSVGPlugin` available | Register plugins once per module. Always revert contexts on slide leave. |
| Page transitions | **View Transitions API** (`document.startViewTransition`) with no-API fallback | Named groups: `stage`, `backdrop`, `topbar`, `rail`. |
| WebGL | **OGL 1.0** (`src/scripts/ribbon.ts`) | Title + vote slides only. |
| Maps | **d3-geo 3.1 + topojson-client 3.1 + us-atlas 3.0** (Albers USA, pre-projected 975×610) | Geometry emitted once as an SVG sprite (`MapSprite.astro`); minimaps use `<use>`. Keep it that way. |
| Fonts | Fontsource, self-hosted: **Cinzel Variable** (display/inscriptions), **Cormorant Garamond** 400/500 italic (quotes, epigraphs), **Inter Tight Variable** (body/UI), **JetBrains Mono Variable** (labels, figures) | Four families is the ceiling. |
| Hosting | **Vercel**, static | No adapter needed. |

Run `npm run dev` / `npm run build`. `build` runs the parser, `astro check`, then `astro build`; it must finish with **0 errors, 0 warnings, 0 hints**.

## Architecture you must preserve

```
content/source.txt            ← the pasted release, verbatim (source of truth)
scripts/parse-promises.mjs    ← source.txt → src/data/promises.json (fixes paste artifacts, picks a headline figure)
src/data/chapters.ts          ← 13 chapters: region, epigraph, sections[], scene, tone, palette, map
src/data/deck.ts              ← flattens to slides; THROWS if any promise is unassigned/duplicated or count ≠ 127
src/data/site.ts              ← brand, disclaimer, attribution, vote CTA (TODOs marked)
src/pages/index.astro         ← the deck: shared backdrops (one Scene per chapter) + 142 slides + chrome
src/pages/record/index.astro  ← full accessible record (no-JS, SEO, print)
src/components/Scene.astro    ← procedural SVG landscapes (seeded ridges + signature overlays, data-depth layers)
src/components/slides/*       ← Title, Chapter, Promise, Vote, Slide shell
src/components/Chrome.astro   ← top bar, segmented progress rail, chapter index <dialog>
src/scripts/deck.ts           ← navigation engine (keys, click zones, swipe, hash routing, VT)
src/scripts/choreo.ts         ← GSAP entrances (“tide” motion language)
src/scripts/ribbon.ts         ← OGL flag-ribbon shader
```

Slide order: Prologue → for each chapter (Chapter opener → its promises) → Epilogue (vote). Hash routes: `#/begin`, `#/frontier`, `#/frontier/3`, `#/vote`.

## Design system (binding)

**Themes fused:** Greco‑Roman (Cinzel inscriptions, meander bands, colonnades, Roman numerals), classic Americana (stripes, stars, Main Street, steeples, amber waves), futuristic American (mono numerals, WebGL, orbit, precise hairlines).

**Palette:** marble `#f4f1ea`, parchment `#ede6d6`, ink `#0e1a2b`, federal `#1f3a5f`, glory `#8e2b27`, gilt `#b8913a`, sage, sky, sea, granite. Saturation stays low. Each chapter sets `--sky-a --sky-b --land --accent` and `tone` (light/dark). Muted text and hairlines are re-derived per slide (`--fg-muted`, `--hairline`) — never hard-code grey.

**Type scale:** fluid `--step--1 … --step-5` (clamp). Display = Cinzel caps, tracking .08em. Labels = JetBrains Mono caps, tracking .14–.2em. Quotes = Cormorant italic 500. Body = Inter Tight.

**Motion language — “tide”:** arrivals rise 18–24px and fade, `expo.out`, 1.0–1.2s, stagger 0.06–0.09s. Headlines reveal by masked lines. Figures count up over 1.6s `power3.out`. Stage transitions translate 4–6vw with a 6px blur, 720ms `cubic-bezier(.65,0,.35,1)`. Backdrops stay still within a chapter and cross-fade between chapters. Nothing bounces, spins, or loops faster than 2.5s. **Under `prefers-reduced-motion`, everything becomes a ≤200ms fade, counters show final values, the ribbon renders one still frame.**

**Layout:** `--gutter` clamp(16px,4vw,64px); top chrome 56px; rail 44px. Promise “tablet” = translucent sky panel with backdrop blur, 2px radius, hairline border, long soft shadow; two columns (Made | seam | Kept) collapsing to one under 860px.

## Non-negotiables (integrity, legal, accessibility)

1. **No impersonation of government.** No Presidential Seal, no White House or agency logos, no `.gov` styling, no “official” language. The site is its own brand. Credit the release as the source (“As reported by the White House”) on every promise and in `/record`.
2. **Disclaimer.** Render `site.disclaimer` in a bordered box on the Vote slide and `/record` footer (already wired). Leave the TODO text visibly in place until the owner supplies committee wording; do not invent a committee name.
3. **Voting CTA links out only** to `https://vote.gov`. Never hard-code registration deadlines, ID rules, polling hours, or locations.
4. **Imagery:** no photos of real people. Only (a) the procedural scenes, or (b) public-domain / properly licensed landscape imagery with a visible credit (see Work Item 2).
5. **Never invent data, URLs, or citations.** Where a primary-source link is wanted but unknown, leave a typed `TODO` slot.
6. **WCAG 2.2 AA:** text contrast ≥ 4.5:1 (≥ 3:1 for ≥24px) on *every* chapter palette, keyboard-complete, visible focus, `aria-live` slide announcements (wired), skip link to `/record` (wired), no motion-only meaning.

## Work items (do all, in order)

### 1. Scene signatures — finish the landscape set
`Scene.astro` has strong overlays for colonnade, dome, skyline, industry, fields, sea, steeple, mainstreet, orbit. Add distinctive, single-weight overlays for the rest, matching that style (silhouette fills in `--land`, accents in `--accent` ≤ 0.4 opacity, ≤ 40 elements each):
- **mesa** — saguaro silhouettes + a long low fence line receding.
- **plains** — refine: a pipeline catenary and a single water tower; keep the derricks minimal.
- **mountains** — a ranger-style arched gateway and three pine silhouettes on the front ridge.
- **summit** — snow cap (lighter fill on the peak path) + a thin survey line across the face.
- **dawn** (unused — wire it to nothing yet, but implement): sun disk rising over sea + coast.
Acceptance: each chapter’s backdrop is recognizable as its region in a 320px-wide thumbnail.

### 2. Optional photographic layer (build-time, credited, public domain)
Add `scripts/fetch-imagery.mjs` (run manually, not in `build`) that, per chapter, queries:
- **NASA Image and Video Library API** — `https://images-api.nasa.gov/search?q=…&media_type=image` (no key) — for `beyond`, `coasts`.
- **NPS Data API** — `https://developer.nps.gov/api/v1/` (`NPS_API_KEY` env var) — for `commons`, `monument`.
- **Library of Congress JSON API** — `https://www.loc.gov/photos/?q=…&fo=json` — filter to items whose rights statement indicates no known restrictions — for `heartland`, `forge`, `mainstreet`, `hearth`.
Download one landscape per chapter to `src/assets/chapters/<id>.jpg`, record `{ title, creator, source_url, rights }` in `src/data/imagery.json`. Render via `astro:assets` `<Image>` as a **duotone** (CSS `mix-blend-mode: multiply` over `--sky-b`, `filter: grayscale(1) contrast(1.05)`, opacity ≤ 0.35) *behind* the SVG scene, never replacing it. Show the credit in `/record` and in a tiny `ⓘ` popover on the chapter slide. Skip any image with unclear rights or an identifiable person. If no key/network, the site must look identical to today.

### 3. Promise slide polish
- **Share:** a quiet “Share” control in the slide footer → Web Share API if present, else copy `location.href` with a toast (“Link copied”). Links are the hash route.
- **Long quotes:** when a promise has two quotes (`made.length > 1`), show them as a stacked pair with a gilt hairline between; never shrink below `--step-1`.
- **Figure:** keep the existing count-up; additionally draw a 1px gilt underline under the figure with `DrawSVGPlugin` (0.9s, after count completes).
- **Optional status field:** extend the parser/data with `status?: "enacted" | "in-effect" | "in-progress" | "in-litigation"` (default `undefined`, owner fills manually in `src/data/status.json` keyed by promise id). When set, render a small mono pill beside “Promise kept”. Do **not** infer statuses yourself.

### 4. Chapters index ↔ deck continuity
Use GSAP `Flip` so clicking a card in the chapters `<dialog>` morphs the card into the chapter slide’s backdrop (card rect → full viewport) before the slide reveals. On chapter openers, animate the minimap: non-highlighted states fade to 9% first, then highlighted states fill in a west→east stagger (sort by state centroid x, available from `d3-geo` `geoPath().centroid` at build — emit as `data-cx`).

### 5. Ribbon & performance hygiene
- Pause the RAF loop on `document.visibilitychange` (hidden) and resume on visible.
- Lower `dpr` to 1 when `navigator.hardwareConcurrency <= 4` or `saveData`.
- Budgets (Lighthouse mobile, `npm run preview`): Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100. LCP < 2.0s, CLS < 0.02, total JS ≤ 120 kB gz. `index.html` ≤ 600 kB raw.

### 6. `/record` — make it a real reference
- Client-side filter: a single input (“Filter promises…”) + chapter chips; filters `li` by text and chapter with no framework, keeps URL in sync (`?q=&chapter=`). Works without JS (everything visible).
- Each promise gets a copy-link anchor (`#p-<id>`) and a “View in the journey →” link to its hash route.
- Print stylesheet: single column, chapter page breaks, URLs printed after links.

### 7. Social cards
Generate static OG images at build with **Satori + @resvg/resvg-js** (check current versions on npm; pin them): one for `/`, one for `/record`, one per chapter (`/og/<chapter>.png`). Composition: chapter sky gradient, Cinzel title, numeral, meander rule, site name. Wire per-route `og:image`. No people, no seals.

### 8. Analytics & deploy
- Add **Vercel Web Analytics** (cookieless). Custom events: `slide_reached` (chapter id, ordinal; throttle to chapter openers + every 10th promise), `cta_vote_click`, `record_open`, `share`.
- `vercel.json`: long-cache `/_astro/*` (immutable), short-cache HTML.
- Keep `site` in `astro.config.mjs` and `src/data/site.ts` in sync.

## Acceptance tests (write them as a Playwright script in `tests/deck.spec.ts`)

1. `/` loads with no console errors; `→` ×3 reaches `#/frontier/2`; browser Back returns to `#/frontier/1`.
2. `Esc` opens the chapters dialog; clicking “The Coasts” lands on `#/coasts`; focus is on the chapter heading.
3. Deep link `#/beyond/4` renders the correct promise with the dark palette and legible muted text (assert computed contrast ≥ 4.5:1 for `.eyebrow`).
4. With `reducedMotion: "reduce"`, figures show final values immediately and no element has a running GSAP tween after 300ms.
5. `/record` lists exactly 127 `li` items; filtering “tariff” leaves ≥ 1 and < 127; disabling JS shows all 127.
6. At 390×844, no horizontal scroll on any slide; the tablet never overlaps the rail.
7. `npm run build` → 0 errors / 0 warnings / 0 hints; deck validation throws if a section slug is removed from `chapters.ts` (unit-test `buildDeck`).

## Do not

- Introduce React/Vue/Svelte, a CMS, a database, or server rendering.
- Add autoplaying audio/video, parallax-on-scroll, cursor trails, or confetti.
- Paraphrase or “improve” quoted promise text; edit `content/source.txt` only to fix copy/paste artifacts (and add them to `FIXES` in the parser instead where possible).
- Add fundraising, email capture, or tracking pixels beyond item 8 unless the owner asks.
- Remove the `/record` page or the deck’s build-time validation.

Finish by running the full build and the Playwright suite, then report: what changed (by work item), anything left as TODO for the owner, and Lighthouse scores.
