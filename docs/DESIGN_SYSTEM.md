# Rava Design System v2.0

Enterprise design system for the Rava KPI platform — Persian, RTL, light + dark.

A living copy of everything below renders at **`/design-system`**. That page
imports the same components the product uses, so it cannot drift from reality.

---

## 1. Principles

1. **Data outranks decoration.** Grid lines recede, marks are thin, and nothing
   is coloured for its own sake.
2. **Colour never carries meaning alone.** Every status, band and series ships
   with an icon, a label, or both.
3. **One rhythm.** A single spacing scale, one motion curve set, one focus ring.
4. **Both themes are designed, not derived.** Dark is a selected set of steps
   validated against the dark surface — never an inverted light palette.
5. **Logical properties.** `start`/`end` rather than `left`/`right`, so the same
   markup reads correctly in RTL and LTR.

---

## 2. Token architecture

Three layers, declared in [`src/app/globals.css`](../src/app/globals.css) and
bound to Tailwind in [`tailwind.config.ts`](../tailwind.config.ts).

| Layer | What it holds | Who reads it |
|---|---|---|
| **L1 primitives** | Raw ramps: `--sand-*`, `--indigo-*`, status hues | Only L2 |
| **L2 semantic** | Roles: `--background`, `--foreground-muted`, `--danger`, `--chart-3` | Components |
| **L3 component** | `--sidebar`, `--navbar`, `--overlay` | One component each |

Every colour is stored as space-separated RGB channels so Tailwind's opacity
modifier keeps working:

```css
--primary: 79 70 229;         /* L2 */
```
```tsx
<div className="bg-primary/10 text-primary" />
```

**Rule:** components never reference an L1 token. If a component needs a colour
that has no semantic name yet, add the semantic token — don't reach past it.

---

## 3. Colour

### Neutrals — "Sand"

A warm-tinted grey (hue ≈ 35°, very low chroma). This is what carries the
brand's warmth: it is in every surface, border and line of text, so the product
reads warm without spending the accent colour on it.

| Step | Light use | Contrast on white |
|---|---|---|
| `sand-50` | page background | — |
| `sand-100` | sunken surface, muted fill | — |
| `sand-200` | border | — |
| `sand-300` | strong border, axis | — |
| `sand-500` | `foreground-subtle` — icons and decoration only | 3.71:1 |
| `sand-600` | `foreground-muted` — secondary body text | 5.70:1 ✓ AA |
| `sand-700` | `foreground-secondary` | 8.14:1 ✓ AAA |
| `sand-900` | `foreground` | 15.76:1 ✓ AAA |

`foreground-subtle` is deliberately below 4.5:1 and is reserved for icons,
placeholders and decoration. Body copy uses `foreground-muted` or darker.

### Brand — Indigo

`--primary` is `#4F46E5` (6.29:1 on white, 5.94:1 on the dark surface).

It is **cool by design.** A warm primary would collide with the amber/red status
colours in a product whose entire job is showing good/bad performance, so the
warmth lives in the neutrals and the accent stays unambiguous.

### Status

Never themed by the brand. Each ships with an icon or a word.

| Role | Light | Dark | Light contrast |
|---|---|---|---|
| `success` | `#15803D` | `#4ADE80` | 5.02:1 |
| `warning` | `#B45309` | `#FBBF24` | 5.02:1 |
| `danger` | `#DC2626` | `#F87171` | 4.83:1 |
| `info` | `#2563EB` | `#60A5FA` | 5.17:1 |

### Data visualisation

Eight categorical slots, assigned in **fixed order** and **never cycled**. A
ninth series folds into "other" or gets its own facet.

| Slot | Hue | Light | Dark | Team role |
|---|---|---|---|---|
| 1 | blue | `#2A78D6` | `#3987E5` | استراتژیست |
| 2 | orange | `#EB6834` | `#D95926` | دستیار استراتژیست |
| 3 | aqua | `#1BAF7A` | `#199E70` | نویسنده |
| 4 | yellow | `#EDA100` | `#C98500` | گرافیست |
| 5 | magenta | `#E87BA4` | `#D55181` | تدوینگر |
| 6 | green | `#008300` | `#008300` | تصویربردار |
| 7 | violet | `#4A3AA7` | `#9085E9` | ادمین |
| 8 | red | `#E34948` | `#E66767` | ادمین حضوری |

Validated with the data-viz validator against this product's own surfaces
(`#FFFFFF` light, `#1A1815` dark):

- Light: worst adjacent-pair CVD ΔE **9.1**, normal-vision ΔE **19.6**
- Dark: worst adjacent-pair CVD ΔE **8.4**, normal-vision ΔE **19.3**, all ≥ 3:1

Three light-mode slots sit below 3:1 against white, so the **relief rule**
applies: any chart using them ships a legend or direct labels. `ChartLegend` is
present on every multi-series chart for exactly this reason.

Each role also has an `-ink` step (≥ 4.6:1 in both themes) for coloured text —
used by `RoleBadge`, never the raw slot.

### Score bands

The 1–10 KPI scale maps onto four ordinal bands. Every use pairs the colour with
its Persian word.

| Band | Range | Label | Token |
|---|---|---|---|
| strong | 8–10 | عالی | `--score-strong` |
| fair | 6–7 | قابل قبول | `--score-fair` |
| weak | 4–5 | نیازمند بهبود | `--score-weak` |
| critical | 0–3 | بحرانی | `--score-critical` |

Read them from [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts) via
`getScoreBand(score)` — never re-derive the thresholds at a call site.

---

## 4. Typography

Two self-hosted variable families, subset to Arabic + Latin and served through
`next/font/local` (preloaded, zero layout shift).

| Role | Family | Why |
|---|---|---|
| Body / UI | **Vazirmatn** | The most legible modern Persian text face at small sizes, which is most of a dashboard |
| Display / figures | **Estedad** | Geometric and tighter; earns its place on headings and headline numbers |

Each family stacks its Arabic subset ahead of its Latin one, so the browser
falls back per glyph: Persian text gets the Persian cut, Latin words and digits
get the matching Latin one.

### Scale

Sizes match Tailwind's defaults on purpose — only leading and tracking are
re-tuned, because Persian needs more leading than Latin at every size.

| Token | Size | Line-height | Use |
|---|---|---|---|
| `text-2xs` | 11px | 1.5 | dense counters |
| `text-xs` | 12px | 1.6 | labels, captions |
| `text-sm` | 14px | 1.7 | secondary text, table cells |
| `text-base` | 16px | 1.75 | body |
| `text-lg` | 18px | 1.6 | card titles |
| `text-2xl` | 24px | 1.4 / −0.01em | section titles |
| `text-3xl` | 30px | 1.3 / −0.015em | page titles |
| `text-4xl` | 36px | 1.2 / −0.02em | hero figures |

### Numerals

`th`, `td`, `time` and anything marked `data-numeric` get **tabular figures**, so
a changing value never shifts the layout around it.

User-facing numbers are formatted with `faNumber()` / `faPercent()`
(Persian digits). Ratios are written with **«از»**, never a slash: a `9.1 / 10`
run reorders in RTL and reads back to front.

---

## 5. Spacing, radius, elevation

- **Spacing:** a 4pt grid at dashboard density — 8/12/16/20/24 inside components,
  20/24 between sections.
- **Radius:** `sm` 6px · `md` 8px · `lg` 12px · `xl` 16px · `2xl` 20px.
  Controls use `lg`, cards use `xl`, modals use `2xl`.
- **Elevation:** five steps, all warm-tinted — shadows pick up the sand hue and
  are never pure black in light mode.

| Token | Use |
|---|---|
| `shadow-xs` | resting stat tiles, inputs |
| `shadow-sm` | cards |
| `shadow-md` | hovered cards |
| `shadow-lg` | popovers, dropdowns |
| `shadow-xl` | modals |

---

## 6. Motion

One rhythm for the whole product.

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120ms | colour and hover changes |
| `duration-base` | 200ms | state changes, elevation |
| `duration-slow` | 320ms | entrances, drawer |
| `ease-out` | `cubic-bezier(.16,1,.3,1)` | entering |
| `ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | press feedback |

- Only `transform` and `opacity` are animated.
- Press feedback is `scale(0.98)` — it never moves neighbouring layout.
- `prefers-reduced-motion: reduce` collapses every animation and transition to
  0.01ms globally. Motion is an enhancement here, never load-bearing.

---

## 7. Component library

`src/components/ui/` — every screen composes from these.

| Component | Notes |
|---|---|
| `Button` | 7 variants, `loading` prop, 40px+ target, `active:scale-[0.98]` |
| `Card` | `elevation` and `interactive` variants; header becomes two columns when a `CardAction` is present |
| `Badge` | 9 variants + optional colour `dot` |
| `Input` / `Textarea` / `Select` | 44px on mobile (16px text avoids iOS zoom), 40px on desktop |
| `Label` + `RequiredMark` | required marker announces «الزامی» to screen readers |
| `CheckboxField` | full-row hit area with a persistent hint |
| `Table` | logical `start`/`end` alignment, sticky-ready header, own scroll container |
| `Tabs` | `solid` (panels) and `underline` (page sections) |
| `Dialog` | blurred scrim, physical centring (percentage translates are not direction-aware) |
| `PageHeader` | breadcrumbs + title + description + actions; every page uses it |
| `StatCard` / `StatGrid` | the "not a chart" answer for a single headline figure; `delta` states direction in words |
| `EmptyState` | explains the situation and offers the next step |
| `RoleBadge` | label + colour dot; one categorical slot per role |
| `ScoreBadge` / `ScoreMeter` / `ScoreScale` / `ScoreBandLegend` | the 1–10 KPI vocabulary |
| `RankBadge` | numbered podium position — no medal emoji |
| `ChartFrame` / `ChartTooltip` / `ChartLegend` | reserved height, real empty state, Persian ticks |
| `ThemeToggle` | three-state light / dark / system |

---

## 8. Charts

Rules enforced across every chart in the product:

- **One axis.** Never two y-scales. Two measures of different scale get two
  charts. (The workgroup analytics chart was split for exactly this reason.)
- **Legend whenever there are ≥ 2 series.** Rendered as HTML so it wraps and
  stays keyboard-reachable.
- **Long Persian labels go on a category axis in a horizontal bar chart** rather
  than rotated 45° under a vertical one.
- **Ordinal data gets bars, not pie.** Score-band distributions use the band
  colours on a shared baseline.
- **Reserved height + real empty state.** A chart with no data shows an
  explanation, never a bare axis frame.
- **`summary` prop** gives screen readers the takeaway in words.
- RTL: category axes take `reversed`, value axes take `orientation="right"`.

---

## 9. Accessibility baseline

- Body text ≥ 4.5:1 in both themes; large text and icons ≥ 3:1.
- One focus treatment: a 2px `--ring` outline at 2px offset, on `:focus-visible`.
- Touch targets ≥ 44px; the 1–10 score scale is two rows of five on phones so
  every step clears that.
- Colour is never the only signal — status, bands and series all carry text.
- A skip link precedes the shell; `<main>` is focusable for post-navigation focus.
- Pinch-zoom is never disabled.
- Charts expose a text `summary`; tables use logical alignment and real headers.

---

## 10. Adding to the system

1. **Need a colour?** Add a *semantic* token in `globals.css` (both themes), map
   it in `tailwind.config.ts`. Never hardcode a hex in a component.
2. **Need a component?** If two screens need it, it belongs in
   `src/components/ui/`. One screen — keep it local to that file.
3. **Need a chart?** Compose `ChartFrame` + `GRID_PROPS` + `AXIS_PROPS` +
   `ChartTooltip`, take colours from `chartColor(slot)`, and add `ChartLegend`
   when there are two or more series.
4. **Changing the categorical palette?** Re-run the data-viz validator against
   both surfaces before shipping; the slot order is the CVD-safety mechanism, not
   a cosmetic choice.
