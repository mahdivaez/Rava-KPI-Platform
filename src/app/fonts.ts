import localFont from "next/font/local"

/**
 * Typefaces.
 *
 * Two families, self-hosted as variable woff2 so a single file covers the
 * whole 100–900 range:
 *
 *   Vazirmatn — UI and body. The most legible modern Persian text face at
 *   small sizes, which is most of a dashboard.
 *   Estedad   — display. Geometric and a little tighter; used for headings
 *   and headline figures where the extra character earns its place.
 *
 * Each family ships as two subsets (Arabic and Latin) with disjoint glyph
 * coverage, so they are declared separately and stacked in globals.css:
 * the browser falls back per glyph, giving Persian text the Persian face and
 * Latin words and digits the matching Latin one.
 */

/* next/font requires every option to be an inline literal — it reads these
   statically at build time — so the fallback stack is repeated per family. */

export const vazirmatn = localFont({
  src: "../fonts/vazirmatn-arabic-wght-normal.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: false,
})

export const vazirmatnLatin = localFont({
  src: "../fonts/vazirmatn-latin-wght-normal.woff2",
  variable: "--font-vazirmatn-latin",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: false,
})

export const estedad = localFont({
  src: "../fonts/estedad-arabic-wght-normal.woff2",
  variable: "--font-estedad",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: false,
})

export const estedadLatin = localFont({
  src: "../fonts/estedad-latin-wght-normal.woff2",
  variable: "--font-estedad-latin",
  weight: "100 900",
  style: "normal",
  display: "swap",
  // Display face; the Latin cut is only needed once headings render.
  preload: false,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: false,
})

/** Applied to <html> so every token below can reference the families. */
export const fontVariables = [
  vazirmatn.variable,
  vazirmatnLatin.variable,
  estedad.variable,
  estedadLatin.variable,
].join(" ")
