# Sea to Shining Sea

A click-through, presentational site walking visitors “from sea to shining sea” through the 127 promises in the White House release *Promises Made, Promises Kept, Results Delivered* — 13 regional chapters, a civic call to action, and a full plain-text record.

```bash
npm install
npm run dev        # parses content/source.txt, starts Astro
npm run build      # parse → astro check → static build in dist/
```

**Navigate:** ← → / Space / click · Esc = chapter index · deep links like `/#/coasts/4` · `/record` = everything on one page.

## Where things live
| Path | What |
|---|---|
| `content/source.txt` | The pasted release, verbatim. Edit → re-run `npm run parse`. |
| `src/data/chapters.ts` | The 13 chapters: region, epigraph, palette, scene, map, which sections they hold. |
| `src/data/site.ts` | Brand name, **disclaimer (TODO)**, attribution, vote link, election date (verify). |
| `src/components/Scene.astro` | Procedural SVG landscapes — no photo licensing needed. |
| `src/scripts/` | Deck engine, GSAP choreography, WebGL ribbon. |
| `PROMPT.md` | The one-shot development prompt for finishing the site. |

## Before launch
- Fill every `TODO` in `src/data/site.ts` and `astro.config.mjs` (committee disclaimer wording via counsel, domain).
- Add the canonical release URL in `scripts/parse-promises.mjs` (`source.url`).
- Deploy: connect the repo to Vercel (static, no adapter).
