import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static output: deploys to Vercel (or any static host) with zero config.
export default defineConfig({
  site: "https://example.com", // TODO: keep in sync with src/data/site.ts
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
