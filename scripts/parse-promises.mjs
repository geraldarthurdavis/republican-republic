#!/usr/bin/env node
/**
 * Parses content/source.txt (the White House "Promises Made, Promises Kept"
 * release, pasted verbatim) into src/data/promises.json.
 *
 * Re-run any time the source text changes:  npm run parse
 *
 * Output shape:
 * {
 *   source: { title, publisher, retrieved, url },
 *   intro: string,
 *   closing: string,
 *   sections: [{ slug, title, promises: [Promise] }],
 *   count: number
 * }
 * Promise = {
 *   id, section, made: [{ quote, date, isoDate }], kept: string,
 *   figure: { raw, prefix, value, decimals, suffix } | null
 * }
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "content/source.txt"), "utf8");

// Copy/paste artifacts where hyperlinked words lost their spacing.
const FIXES = [
  ["encounteringjust", "encountering just"],
  ["expandedit", "expanded it"],
  ["invokedthe", "invoked the"],
  ["Actto", "Act to"],
  ["companiesrepresenting", "companies representing"],
  ["ratein", "rate in"],
  ["highest-everrenewable", "highest-ever renewable"],
  ["axedcostly", "axed costly"],
  ["launchedthe", "launched the"],
  ["signedthe", "signed the"],
  ["outpetroleum", "out petroleum"],
  ["exitedthe", "exited the"],
  ["“gender-affirming care“", "“gender-affirming care”"],
];
const clean = (s) => {
  let out = s.replace(/ /g, " ");
  for (const [a, b] of FIXES) out = out.split(a).join(b);
  return out.replace(/\s{2,}/g, " ").trim();
};

const slugify = (s) =>
  s.toLowerCase().replace(/[’']/g, "").replace(/&/g, "and")
    .replace(/\bu\.s\./g, "us").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    .split("-").filter((w) => !["the", "and", "of", "in", "our", "to"].includes(w))
    .slice(0, 4).join("-");

const toIso = (d) => {
  const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (!m) return null; // e.g. "2024"
  const [, mo, da, yr] = m;
  return `20${yr}-${mo.padStart(2, "0")}-${da.padStart(2, "0")}`;
};

// Pick one headline figure per promise for the count-up treatment.
const YEARS = /^(19|20)\d{2}$/;
function pickFigure(text) {
  const re = /(\$)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(\s?(?:%|percent|trillion|billion|million))?/g;
  let best = null;
  for (const m of text.matchAll(re)) {
    const [raw, dollar = "", num, unit = ""] = m;
    if (!dollar && !unit && YEARS.test(num)) continue;
    const value = Number(num.replace(/,/g, ""));
    if (!Number.isFinite(value) || value < 2) continue;
    const score = (dollar ? 2 : 0) + (unit ? 2 : 0) + (num.includes(",") ? 1 : 0);
    const cand = {
      raw: raw.trim(),
      prefix: dollar,
      value,
      decimals: (num.split(".")[1] || "").length,
      suffix: unit.replace("percent", "%").trim() === "%" ? "%" : unit.trimEnd(),
      score,
    };
    if (!best || cand.score > best.score) best = cand;
    if (score >= 4) break;
  }
  if (!best) return null;
  const { score, ...fig } = best;
  return fig;
}

const lines = src.split(/\r?\n/).map(clean).filter(Boolean);
const startIdx = lines.findIndex((l) => /^Here are \d+ Promises/.test(l));
const intro = lines.slice(3, startIdx).join(" ");
const closingIdx = lines.findIndex((l) => l.startsWith("President Trump has kept more promises"));
const body = lines.slice(startIdx + 1, closingIdx === -1 ? undefined : closingIdx);

const sections = [];
let current = null;
let pendingMade = null;

for (const line of body) {
  if (line.startsWith("PROMISE MADE:")) {
    const made = [...line.matchAll(/“([^”]+)”\s*\(([^)]+)\)/g)].map((m) => ({
      quote: m[1].trim(),
      date: m[2].trim(),
      isoDate: toIso(m[2].trim()),
    }));
    if (!made.length) throw new Error(`Unparsed PROMISE MADE: ${line}`);
    pendingMade = made;
  } else if (line.startsWith("✅ PROMISE KEPT:")) {
    if (!pendingMade || !current) throw new Error(`Orphan PROMISE KEPT: ${line}`);
    const kept = line.replace("✅ PROMISE KEPT:", "").trim();
    current.promises.push({
      id: `${current.slug}-${current.promises.length + 1}`,
      section: current.slug,
      made: pendingMade,
      kept,
      figure: pickFigure(kept),
    });
    pendingMade = null;
  } else {
    current = { slug: slugify(line), title: line, promises: [] };
    sections.push(current);
  }
}

const out = {
  source: {
    title: "President Trump’s Second Term: Promises Made, Promises Kept, Results Delivered",
    publisher: "The White House",
    retrieved: "2026-11-02",
    url: null, // TODO: paste the canonical whitehouse.gov URL
  },
  intro,
  closing: closingIdx === -1 ? "" : lines[closingIdx],
  sections,
  count: sections.reduce((n, s) => n + s.promises.length, 0),
};

writeFileSync(join(root, "src/data/promises.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Parsed ${out.count} promises across ${sections.length} sections.`);
for (const s of sections) console.log(`  ${String(s.promises.length).padStart(2)}  ${s.slug}`);
