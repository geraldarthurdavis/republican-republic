/**
 * "Sea to shining sea" — a slow WebGL ribbon of federal blue, marble and
 * muted red, flowing left to right like a flag in a light breeze.
 * OGL (~8 kB gz). Renders only while its slide is visible; a single still
 * frame under prefers-reduced-motion; silently absent without WebGL.
 */
import { Renderer, Program, Mesh, Triangle } from "ogl";

const frag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;

vec3 ink    = vec3(0.055, 0.102, 0.169);
vec3 blue   = vec3(0.122, 0.227, 0.373);
vec3 marble = vec3(0.957, 0.945, 0.918);
vec3 glory  = vec3(0.557, 0.169, 0.153);
vec3 gilt   = vec3(0.722, 0.569, 0.227);

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float t = uTime * 0.06;

  // Wave field: a long swell plus a finer ripple, both travelling eastward.
  float swell = sin(uv.x * 2.2 * aspect - t * 3.0) * 0.06 + sin(uv.x * 5.3 * aspect - t * 5.0 + 1.3) * 0.018;
  float y = uv.y + swell * smoothstep(0.0, 1.0, uv.x + 0.2);

  // Seven bands (a quiet nod to the stripes), confined to a ribbon near the horizon.
  float band = fract((y - 0.18) * 7.0 / 0.5);
  float inRibbon = smoothstep(0.16, 0.2, y) * (1.0 - smoothstep(0.66, 0.7, y));
  float stripe = step(0.5, band);
  vec3 ribbon = mix(marble, glory, stripe * 0.55);

  // Light: a sheen that slides along the swell.
  float sheen = pow(max(0.0, sin(uv.x * 3.0 * aspect - t * 3.0 + y * 4.0)), 6.0);
  ribbon += gilt * sheen * 0.18;

  vec3 sky = mix(ink, blue, smoothstep(-0.2, 1.1, uv.y));
  vec3 col = mix(sky, ribbon, inRibbon * 0.16);

  // Vignette
  float v = smoothstep(1.25, 0.3, length((uv - 0.5) * vec2(aspect, 1.0)));
  gl_FragColor = vec4(col * mix(0.82, 1.0, v), 1.0);
}`;

const vert = /* glsl */ `
attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

type Ribbon = { slide: HTMLElement; render: (t: number) => void; resize: () => void };

export function mountRibbons() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ribbons: Ribbon[] = [];

  document.querySelectorAll<HTMLCanvasElement>("canvas[data-ribbon]").forEach((canvas) => {
    try {
      const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 1.75), alpha: false });
      const gl = renderer.gl;
      const program = new Program(gl, { vertex: vert, fragment: frag, uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] } } });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      const resize = () => {
        // Measure the parent: OGL writes an inline px size on the canvas itself.
        const host = canvas.parentElement!;
        const { clientWidth: w, clientHeight: h } = host;
        if (!w || !h) return;
        renderer.setSize(w, h);
        program.uniforms.uRes.value = [w, h];
      };
      ribbons.push({
        slide: canvas.closest(".slide") as HTMLElement,
        resize,
        render: (t) => { program.uniforms.uTime.value = t / 1000; renderer.render({ scene: mesh }); },
      });
    } catch {
      canvas.remove(); // no WebGL: the CSS gradient behind it carries the slide
    }
  });

  let active: Ribbon | null = null;
  let raf = 0;
  const loop = (t: number) => { active?.render(t); raf = requestAnimationFrame(loop); };
  addEventListener("resize", () => active?.resize());

  return {
    setActive(slide: HTMLElement | null) {
      cancelAnimationFrame(raf);
      active = ribbons.find((r) => r.slide === slide) ?? null;
      if (!active) return;
      requestAnimationFrame(() => {
        if (!active) return;
        active.resize();
        if (reduced) active.render(12000);
        else raf = requestAnimationFrame(loop);
      });
    },
  };
}
