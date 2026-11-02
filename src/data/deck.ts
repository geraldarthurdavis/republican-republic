/**
 * Flattens chapters + promises into an ordered slide list for the deck.
 * Throws at build time if any promise is unassigned or assigned twice.
 */
import { chapters, promiseData, sectionsBySlug, type Chapter } from "./chapters";

type Promise = (typeof promiseData.sections)[number]["promises"][number];

export type Slide =
  | { kind: "title"; id: string }
  | { kind: "chapter"; id: string; chapter: Chapter; count: number; sectionTitles: string[] }
  | { kind: "promise"; id: string; chapter: Chapter; promise: Promise; sectionTitle: string; ordinal: number }
  | { kind: "vote"; id: string };

export function buildDeck(): Slide[] {
  const seen = new Set<string>();
  const slides: Slide[] = [{ kind: "title", id: "begin" }];
  let ordinal = 0;

  for (const chapter of chapters) {
    const sections = chapter.sections.map((slug) => {
      const s = sectionsBySlug[slug];
      if (!s) throw new Error(`Chapter "${chapter.id}" references unknown section "${slug}"`);
      if (seen.has(slug)) throw new Error(`Section "${slug}" assigned to more than one chapter`);
      seen.add(slug);
      return s;
    });
    const count = sections.reduce((n, s) => n + s.promises.length, 0);
    slides.push({ kind: "chapter", id: chapter.id, chapter, count, sectionTitles: sections.map((s) => s.title) });
    let i = 0;
    for (const s of sections) {
      for (const promise of s.promises) {
        ordinal += 1; i += 1;
        slides.push({ kind: "promise", id: `${chapter.id}/${i}`, chapter, promise, sectionTitle: s.title, ordinal });
      }
    }
  }

  const missing = promiseData.sections.filter((s) => !seen.has(s.slug)).map((s) => s.slug);
  if (missing.length) throw new Error(`Sections not assigned to any chapter: ${missing.join(", ")}`);
  if (ordinal !== promiseData.count) throw new Error(`Deck has ${ordinal} promises, source has ${promiseData.count}`);

  slides.push({ kind: "vote", id: "vote" });
  return slides;
}

export const TOTAL_PROMISES = promiseData.count;
