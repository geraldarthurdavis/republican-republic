/**
 * Click-through deck engine.
 * - Keyboard (←/→, Space, PageUp/Down, Home/End, Esc), click zones, swipe
 * - Hash routing: #/begin, #/frontier, #/frontier/3, #/vote  (shareable, back-button aware)
 * - View Transitions API for the stage, with a no-API fallback
 * - Hands each newly active slide to choreo.ts for its entrance
 */
import { enter, leave, prefersReducedMotion } from "./choreo";
import { mountRibbons } from "./ribbon";

export function initDeck() {
  const deck = document.querySelector<HTMLElement>("[data-deck]");
  if (!deck) return;
  const slides = [...deck.querySelectorAll<HTMLElement>(".slide")];
  const backdrops = new Map([...document.querySelectorAll<HTMLElement>("[data-backdrop]")].map((b) => [b.dataset.backdrop!, b]));
  const where = document.querySelector<HTMLElement>("[data-where]");
  const counter = document.querySelector<HTMLElement>("[data-counter]");
  const announcer = document.querySelector<HTMLElement>("[data-announcer]");
  const overview = document.querySelector<HTMLDialogElement>("[data-overview]");
  const fills = [...document.querySelectorAll<HTMLElement>("[data-fill]")];
  const root = document.documentElement;
  const ribbons = mountRibbons();

  let current = -1;
  let busy = false;

  const indexFromHash = () => {
    const id = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    if (!id) return 0;
    const i = slides.findIndex((s) => s.dataset.slideId === id);
    return i === -1 ? 0 : i;
  };

  function paintChrome(i: number) {
    const s = slides[i];
    const chapter = s.dataset.chapter ?? "";
    root.dataset.tone = s.dataset.tone ?? "light";
    root.dataset.chapter = chapter;
    if (where) where.textContent = s.getAttribute("aria-label")?.split(" — ")[0] ?? "";
    if (counter) counter.textContent = `${i + 1} / ${slides.length}`;
    if (announcer) announcer.textContent = s.getAttribute("aria-label") ?? "";

    // Progress rail: completed chapters full, current chapter partial.
    for (const f of fills) {
      const first = slides.findIndex((x) => x.dataset.chapter === f.dataset.fill);
      const last = slides.findLastIndex((x) => x.dataset.chapter === f.dataset.fill);
      const pct = i > last ? 100 : i < first ? 0 : ((i - first + 1) / (last - first + 1)) * 100;
      f.style.width = `${pct}%`;
    }

    for (const [id, b] of backdrops) b.hidden = id !== chapter;
    ribbons.setActive(s.dataset.kind === "title" || s.dataset.kind === "vote" ? s : null);
  }

  function swap(next: number) {
    if (current >= 0) {
      leave(slides[current]);
      slides[current].hidden = true;
    }
    slides[next].hidden = false;
    current = next;
    paintChrome(next);
    // Start the entrance here, inside the View Transition update callback:
    // GSAP's from-states apply before the new snapshot is captured, so the
    // stage slides in with content hidden and the entrance plays once, live.
    // (Calling enter() after the transition finished made content arrive
    // fully rendered, vanish, then animate in a second time.)
    enter(slides[next]);
  }

  async function go(next: number, opts: { push?: boolean } = {}) {
    next = Math.max(0, Math.min(slides.length - 1, next));
    if (next === current || busy) return;
    busy = true;
    root.dataset.dir = next > current ? "fwd" : "back";

    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
    if (doc.startViewTransition && current >= 0) {
      const t = doc.startViewTransition(() => swap(next));
      await t.finished.catch(() => {});
    } else {
      swap(next);
    }

    slides[next].querySelector<HTMLElement>("h1, h2, blockquote")?.focus({ preventScroll: true });
    if (opts.push !== false) history.pushState(null, "", `#/${slides[next].dataset.slideId}`);
    busy = false;
  }

  // Make headings programmatically focusable for screen-reader context.
  slides.forEach((s) => s.querySelectorAll<HTMLElement>("h1, h2, blockquote").forEach((h) => (h.tabIndex = -1)));

  // ── Input ───────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (overview?.open || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select")) return;
    switch (e.key) {
      case "ArrowRight": case "PageDown": case " ": e.preventDefault(); go(current + 1); break;
      case "ArrowLeft": case "PageUp": e.preventDefault(); go(current - 1); break;
      case "Home": e.preventDefault(); go(0); break;
      case "End": e.preventDefault(); go(slides.length - 1); break;
      case "Escape": case "g": e.preventDefault(); overview?.showModal(); break;
    }
  });

  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-action], [data-goto]");
    if (el?.dataset.goto) { overview?.close(); go(Number(el.dataset.goto)); return; }
    switch (el?.dataset.action) {
      case "next": go(current + 1); return;
      case "prev": go(current - 1); return;
      case "first": go(0); return;
      case "overview": overview?.showModal(); return;
      case "overview-close": overview?.close(); return;
    }
    // Click-through: a click on empty stage space advances (left 25% goes back).
    if (!el && (e.target as HTMLElement).closest("[data-deck]") && !(e.target as HTMLElement).closest("a, button, blockquote, .tablet")) {
      go(e.clientX < innerWidth * 0.25 ? current - 1 : current + 1);
    }
  });

  let x0 = 0, y0 = 0;
  deck.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  deck.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  addEventListener("popstate", () => go(indexFromHash(), { push: false }));

  // ── Boot ────────────────────────────────────────────────
  const start = indexFromHash();
  slides.forEach((s, i) => (s.hidden = i !== start));
  current = start;
  paintChrome(start);
  if (!prefersReducedMotion()) requestAnimationFrame(() => enter(slides[start]));
}
