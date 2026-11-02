/**
 * Per-slide entrance choreography (GSAP 3.13+, all plugins free).
 * Motion language: "tide" — things arrive from slightly below, unhurried,
 * settling with a long ease. Nothing bounces, nothing spins.
 */
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);
gsap.defaults({ ease: "expo.out", duration: 1.1 });

const contexts = new WeakMap<HTMLElement, gsap.Context>();

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function enter(slide: HTMLElement) {
  if (prefersReducedMotion()) return;
  contexts.get(slide)?.revert();

  const ctx = gsap.context(() => {
    const tl = gsap.timeline();

    slide.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      tl.from(split.lines, { yPercent: 105, duration: 1.2, stagger: 0.09 }, 0);
    });

    const reveals = slide.querySelectorAll<HTMLElement>("[data-reveal]");
    tl.from(reveals, { y: 18, autoAlpha: 0, duration: 1, stagger: 0.06 }, 0.15);

    slide.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const end = Number(el.dataset.count);
      const decimals = Number(el.dataset.decimals ?? 0);
      const obj = { v: 0 };
      tl.to(obj, {
        v: end, duration: 1.6, ease: "power3.out",
        onUpdate: () => { el.textContent = obj.v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); },
      }, 0.35);
    });

    const tablet = slide.querySelector(".tablet");
    if (tablet) tl.from(tablet, { y: 24, autoAlpha: 0, duration: 1.2 }, 0.05);

    // Chapter openings: let the landscape breathe in, layer by layer.
    // Inside the context so leave() kills it and re-entry never stacks tweens.
    if (slide.dataset.kind === "chapter") {
      const backdrop = document.querySelector<HTMLElement>(`[data-backdrop="${slide.dataset.chapter}"]`);
      backdrop?.querySelectorAll<SVGElement>("[data-depth]").forEach((layer) => {
        const depth = Number(layer.getAttribute("data-depth"));
        gsap.fromTo(layer, { y: 18 * depth }, { y: 0, duration: 2.4, ease: "expo.out", overwrite: "auto" });
      });
    }
  }, slide);

  contexts.set(slide, ctx);
}

export function leave(slide: HTMLElement) {
  contexts.get(slide)?.revert();
  contexts.delete(slide);
}
