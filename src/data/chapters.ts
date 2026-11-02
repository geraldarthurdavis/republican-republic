/**
 * The narrative spine: a journey "from sea to shining sea".
 * Each chapter is a region of the country paired with the policy sections
 * from the White House release that belong to it. Every one of the 127
 * promises is assigned exactly once (validated in src/data/deck.ts).
 */
import data from "./promises.json";

export type Scene =
  | "colonnade" | "mesa" | "skyline" | "mainstreet" | "industry" | "fields"
  | "plains" | "mountains" | "dome" | "sea" | "steeple" | "orbit" | "summit" | "dawn";

export interface Chapter {
  id: string;
  numeral: string;
  title: string;          // short, carved-in-stone name
  region: string;         // the place
  epigraph: string;       // our own temperate one-liner (site voice)
  sections: string[];     // section slugs from promises.json
  scene: Scene;
  tone: "light" | "dark"; // light = dark ink on pale sky
  palette: { skyA: string; skyB: string; land: string; accent: string };
  map: { states?: string[]; points?: [number, number][] }; // FIPS codes / [lon, lat]
}

const ALL = "all";

export const chapters: Chapter[] = [
  {
    id: "frontier", numeral: "I", title: "The Frontier", region: "The Southern Border",
    epigraph: "A nation is first a promise kept at its edges.",
    sections: ["ending-border-invasion-restoring", "launching-largest-deportation-operation"],
    scene: "mesa", tone: "light",
    palette: { skyA: "#F4E3CC", skyB: "#E8B48A", land: "#A65F3B", accent: "#8E2B27" },
    map: { states: ["04", "06", "35", "48"] },
  },
  {
    id: "city", numeral: "II", title: "The City", region: "Metropolitan America",
    epigraph: "Safe streets are the first civil right.",
    sections: ["restoring-law-order-american"],
    scene: "skyline", tone: "dark",
    palette: { skyA: "#15243C", skyB: "#4D6385", land: "#0B1526", accent: "#C9A24A" },
    map: { points: [[-77.04, 38.9], [-74.0, 40.71], [-87.63, 41.88], [-118.24, 34.05], [-95.37, 29.76], [-80.19, 25.76], [-122.42, 37.77]] },
  },
  {
    id: "main-street", numeral: "III", title: "Main Street", region: "Every Hometown",
    epigraph: "Prosperity measured at the kitchen table.",
    sections: ["defeating-inflation-making-america", "delivering-largest-tax-cuts", "protecting-social-security-medicare"],
    scene: "mainstreet", tone: "light",
    palette: { skyA: "#EEF2F4", skyB: "#F4E6CF", land: "#7E6248", accent: "#1F3A5F" },
    map: { states: [ALL] },
  },
  {
    id: "forge", numeral: "IV", title: "The Forge", region: "The Industrial North",
    epigraph: "Things worth having are worth making here.",
    sections: ["igniting-a-blue-collar"],
    scene: "industry", tone: "light",
    palette: { skyA: "#D5DDE4", skyB: "#93A6B8", land: "#2B3846", accent: "#9A2E29" },
    map: { states: ["17", "18", "26", "27", "36", "39", "42", "55"] },
  },
  {
    id: "heartland", numeral: "V", title: "The Heartland", region: "The Farmlands",
    epigraph: "Amber waves, tended by hand.",
    sections: ["putting-americas-farmers-ranchers"],
    scene: "fields", tone: "light",
    palette: { skyA: "#F7EDCF", skyB: "#E9C57A", land: "#B88F3A", accent: "#5E6E48" },
    map: { states: ["17", "19", "20", "27", "29", "31", "38", "46"] },
  },
  {
    id: "wellspring", numeral: "VI", title: "The Wellspring", region: "The Energy Basins",
    epigraph: "Power drawn from our own ground.",
    sections: ["unleashing-american-energy-dominance", "ending-green-new-scam"],
    scene: "plains", tone: "light",
    palette: { skyA: "#F3DDBA", skyB: "#CC8A55", land: "#3A2D22", accent: "#B8913A" },
    map: { states: ["02", "22", "35", "38", "40", "48", "56"] },
  },
  {
    id: "commons", numeral: "VII", title: "The Commons", region: "The National Parks",
    epigraph: "Land held in trust for those not yet born.",
    sections: ["protecting-americas-land-air"],
    scene: "mountains", tone: "light",
    palette: { skyA: "#DCEAF1", skyB: "#9DBACD", land: "#48654C", accent: "#2E5A6B" },
    map: { states: ["02", "04", "06", "08", "30", "49", "53", "56"], points: [[-110.59, 44.43], [-119.54, 37.87], [-112.11, 36.11]] },
  },
  {
    id: "capital", numeral: "VIII", title: "The Capital", region: "Washington, D.C.",
    epigraph: "Government that answers to those who fund it.",
    sections: ["slashing-red-tape-draining", "ending-government-weaponization-restoring", "restoring-transparency-accountability"],
    scene: "dome", tone: "light",
    palette: { skyA: "#F5F2EB", skyB: "#E2DACA", land: "#BDB39E", accent: "#1F3A5F" },
    map: { points: [[-77.04, 38.9]] },
  },
  {
    id: "coasts", numeral: "IX", title: "The Coasts", region: "Atlantic to Pacific",
    epigraph: "Peace, kept by strength at sea and shore.",
    sections: ["restoring-peace-through-strength", "putting-america-first-on", "rebuilding-strongest-military-world"],
    scene: "sea", tone: "light",
    palette: { skyA: "#E2ECF1", skyB: "#A8C3D1", land: "#24495A", accent: "#14273F" },
    map: { states: ["02", "06", "12", "13", "15", "23", "25", "37", "41", "45", "51", "53"], points: [[-76.29, 36.85], [-117.16, 32.72], [-157.95, 21.35]] },
  },
  {
    id: "hearth", numeral: "X", title: "The Hearth", region: "The American South",
    epigraph: "Faith, family, and the schoolhouse door.",
    sections: ["making-america-healthy-again", "empowering-parents-returning-education", "protecting-women-children-biological", "defending-free-speech-faith", "restoring-safety-free-speech"],
    scene: "steeple", tone: "light",
    palette: { skyA: "#F5E9D6", skyB: "#E6C9A2", land: "#5F6E4C", accent: "#8E2B27" },
    map: { states: ["01", "05", "12", "13", "21", "22", "28", "37", "45", "47", "51", "54"] },
  },
  {
    id: "ballot", numeral: "XI", title: "The Ballot", region: "Every Precinct",
    epigraph: "The republic renews itself one citizen at a time.",
    sections: ["securing-elections-ensuring-only"],
    scene: "colonnade", tone: "light",
    palette: { skyA: "#F4F1EA", skyB: "#E9E1CF", land: "#CFC6B2", accent: "#8E2B27" },
    map: { states: [ALL] },
  },
  {
    id: "beyond", numeral: "XII", title: "The Frontier Beyond", region: "Space & Super Intelligence",
    epigraph: "The next frontier is still an American one.",
    sections: ["winning-future-super-intelligence"],
    scene: "orbit", tone: "dark",
    palette: { skyA: "#070E1A", skyB: "#1A2E4C", land: "#0B1526", accent: "#D4B062" },
    map: { points: [[-80.6, 28.57], [-95.09, 29.55], [-121.97, 37.41]] },
  },
  {
    id: "monument", numeral: "XIII", title: "The Monument", region: "Mount McKinley to the Gulf of America",
    epigraph: "We name what we honor.",
    sections: ["honoring-american-greatness"],
    scene: "summit", tone: "light",
    palette: { skyA: "#EFE8DA", skyB: "#D7C6A1", land: "#5D6167", accent: "#B8913A" },
    map: { points: [[-151.0, 63.07], [-90.0, 27.5]] },
  },
];

export const promiseData = data;
export const sectionsBySlug = Object.fromEntries(data.sections.map((s) => [s.slug, s]));
