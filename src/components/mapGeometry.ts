/** Pre-projected US state geometry (us-atlas Albers USA, 975×610), computed once at build. */
import { geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import us from "us-atlas/states-albers-10m.json";

const topo = us as any;
const path = geoPath();
// Round coordinates to 1 decimal: invisible at mini-map size, ~40% smaller markup.
const round = (d: string | null) => (d ?? "").replace(/(\d+\.\d)\d+/g, "$1");

export const states: { id: string; d: string }[] = (feature(topo, topo.objects.states) as any).features.map((f: any) => ({
  id: String(f.id).padStart(2, "0"),
  d: round(path(f)),
}));
export const stateIds = states.map((s) => s.id);
export const borders = round(path(mesh(topo, topo.objects.states, (a: any, b: any) => a !== b) as any));
