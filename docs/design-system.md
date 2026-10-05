# Hack Club NUST — Design System for the redesign

Read BRIEF.md first. This file is the single shared direction. Six people build six
sections from it; if the sections do not look like one page, this file failed. Where it
says "always" or "never", do that. Where it is silent, do the quietest thing.

Hero.tsx is untouched and is the reference for everything below.

---

## 1. Concept

**The hero is a dark room lit by one red light with one toy in it. Every section below is
another room in the same building: a different light level, exactly one toy you can touch,
the same grid on the floor, the same voice on the walls.**

What makes the hero work: one idea, the cursor controls the picture, giant display type sits
*behind* the content, red is a light source (the goggles, the vignette, the watermark glow),
not a paint colour, and headings arrive character by character.

The through-line, in four devices every section must use:

| Device | What it is | Where it comes from |
|---|---|---|
| **The grid** | The hero's 24px dot grid continues as the substrate of every section (`.grid-dots`), recoloured per surface. Hairline rules and card edges sit on it. | Hero dot grid |
| **The scramble** | Every `h2` and every big numeral resolves via `ScrambleIn` when it scrolls into view. Nothing else fades up. | Hero headings, navbar hover |
| **Red is light** | Red appears only as a light source: the LED dot in every kicker, one primary CTA per section, one emphasised phrase per heading, and light coming *out of the artwork* in Chapter. Never as a fill, border, tile, tint or gradient panel. | Goggles / vignette |
| **The cursor is a control** | Each section has one pointer-driven toy that changes the picture (torch, lens, swing, power-on, accordion, scramble). One per section, never two. Touch gets the same control; reduced motion gets the resting state. | The scrub |

Sections are numbered like a build log (`01 — THE CLUB` … `06 — CONTACT`) so the page reads
as one sequence.

---

## 2. Palette

The fix for "red-red": three real surfaces instead of one, a cool accent, and warm neutrals.
Red is kept exactly as it is and used about a tenth as often.

### Surfaces

| Token | Hex | Role |
|---|---|---|
| `ink` | `#0B0507` | Warm black. Hero (untouched), Chapter, Footer. The "red-lit" rooms. |
| `graphite` / `graphite-2` | `#141316` / `#1B1A1E` | Neutral dark. Events. `-2` is the card tone on it. |
| `arcade` / `arcade-2` | `#0C1216` / `#121A1F` | Cool black. Games only. The CRT room. |
| `paper` / `paper-2` / `paper-3` | `#F2EDE4` / `#E9E2D6` / `#DCD3C4` | Warm off-white. About, Team. `-2` cards, `-3` rules/pressed states. |

### Section → surface map (adjacent sections must differ)

```
Hero       ink      (red-lit, video)             ← untouched
01 About   paper    (bright, printed)            ← the breath after the hero
02 Events  graphite (neutral dark)
03 Chapter ink      (cinematic, key art = light)
04 Team    paper    (printed badges)
05 Games   arcade   (cool black, cyan phosphor)
06 Footer  ink      (closes the loop with the hero)
```

### Accent

| Token | Hex | Role |
|---|---|---|
| `brand.coral` / `brand` / `brand.crimson` / `brand.deep` | `#F26251` / `#ED4A52` / `#EB4554` / `#C9303F` | Unchanged. On dark use `brand`/`brand.coral`; on paper use **`brand.deep` only** (4.52:1). |
| `signal` | `#58E0D8` | Cool cyan-teal. Games' phosphor, the `Playable` state, focus rings everywhere, link hover on dark. 11.7:1 on graphite. **Never as text on paper.** |
| `signal.deep` | `#106B66` | Signal for paper: links and the one accent in Team. 5.4:1 on paper. |

### Text tiers (contrast against their surface)

On dark (`ink`, `graphite`, `arcade`) — Tailwind `text-fg*`:

| Token | Hex | Contrast on graphite | Use |
|---|---|---|---|
| `fg` | `#F4F1EC` | 16.7:1 | headings, primary |
| `fg-2` | `#A39F99` | 7.1:1 | body |
| `fg-3` | `#8A857F` | 5.1:1 (4.8:1 on graphite-2) | labels, meta, captions ≥ 12px |
| `brand` as text | `#ED4A52` | 5.9:1 | the one emphasised phrase |

On paper — Tailwind `text-pen*`:

| Token | Hex | Contrast on paper | Use |
|---|---|---|---|
| `pen` | `#141114` | 16.4:1 | headings, primary |
| `pen-2` | `#4F4A45` | 7.5:1 | body. **Minimum tier for body on `paper-2` cards** (pen-3 drops to 4.2 there). |
| `pen-3` | `#6E6861` | 4.7:1 | labels, meta on plain paper |
| `brand.deep` as text | `#C9303F` | 4.5:1 | the one emphasised phrase |

Decorative-only (never for reading): `text-fg/30`, `text-pen/25`, the display watermark at
`opacity-[0.06]`–`[0.12]`.

### Lines

`line` `rgba(244,241,236,0.12)`, `line-strong` `…0.24` on dark. `line-paper`
`rgba(20,17,20,0.14)`, `line-paper-strong` `…0.32` on paper. No other border colours.

### Where red is allowed — the whole list

1. The LED dot in every kicker (`.kicker`).
2. One primary CTA per section (`.btn-primary`). Games' two "Play Now" buttons count as its one — they are the arcade's red button.
3. One emphasised phrase in the `h2`, at most, in `text-brand` (dark) or `text-brand-deep` (paper). Not every section needs one; About and Events have one, the rest do not.
4. Light from the Cyber Hackathon key art in Chapter (it is red; let it be).
5. The AnnouncementBar (temporary, gone after 6 Oct).
6. `::selection`.

Never: section backgrounds, `bg-brand-grad` panels, card backgrounds or borders, hover
borders, icon tiles, tags/pills, glow blobs (`blur-[120px]`), `bg-brand/10` tints, the Team
initials, dots in the grid, status badges, underline decorations.

---

## 3. Type

**Add one Google font: Instrument Sans** (variable 400–700 + italic). Justification: Space
Mono as body copy is the second reason the page looks like a template — long paragraphs in a
monospace at 14px/50% white are hard to read, and the About section is 170 words. A
proportional grotesque for running text gives the page a second register and makes the mono
mean something again (labels, numbers, UI = the terminal voice). It is loaded through the
existing `@import` in `index.css`. The hero is unaffected: it inherits Space Mono from
`html, body` and the inline style in App.tsx, not from `font-sans`.

Note: Space Mono ships only 400 and 700. `font-light` in the hero renders as 400; use `font-normal`.

| Role | Font | Tailwind |
|---|---|---|
| **Display** (one per section: the watermark word or the headline word) | Anton SC | `font-display uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(72px,14vw,220px)]` |
| **H2** section heading | Space Mono 400 | `font-mono font-normal text-[clamp(32px,5.5vw,64px)] leading-[1.0] tracking-[-0.03em]` |
| **H3** card / item title | Space Mono 400 | `font-mono text-[clamp(20px,2.4vw,28px)] leading-tight tracking-[-0.02em]` |
| **Numeral** (stats, prize money, badge numbers) | Space Mono 400 | `font-mono tabular-nums text-[clamp(40px,6vw,72px)] leading-none tracking-[-0.04em]` |
| **Kicker** | Space Mono | `.kicker` (12px, `tracking-[0.22em]`, uppercase, LED dot) |
| **Lede** (the one paragraph under an h2) | Instrument Sans 400 | `font-sans text-[17px] leading-[1.55] sm:text-[19px] max-w-xl` |
| **Body** | Instrument Sans 400 | `font-sans text-[16px] leading-[1.6]` |
| **Body small** | Instrument Sans 400 | `font-sans text-[14px] leading-[1.55]` |
| **Label / meta** | Space Mono | `font-mono text-[12px] uppercase tracking-[0.08em]` |
| **Tag** | Space Mono | `.tag` (11px) |

Rules: H2s are set in sentence case with a full stop, like the hero's copy register
("Already run by this club."). Display words are uppercase and short (one or two words).
Max line length for body is `max-w-prose` (65ch). Kicker always carries the section index:
`01 / The Club`.

Section header anatomy, every section, in this order:
```
.kicker  →  h2 (ScrambleIn)  →  optional lede (font-sans)
```
On desktop the lede may sit right-aligned beside the h2 (as Events does now); on mobile it stacks.

---

## 4. Surfaces & components

The `rounded-2xl border-white/10 bg-white/[0.025]` pillow card is retired everywhere. The
new card is **square-cornered (4px), hairline, and marked with viewfinder ticks** — four
small corner brackets, like a camera's focus frame. That is the one shape the page repeats.
Buttons stay pill-shaped (the hero's buttons are pills; continuity with the hero beats
consistency with the cards).

All of these exist as utilities in `index.css` (section 7); use the class, do not retype it.

| Component | Class | Looks like |
|---|---|---|
| Card (dark) | `card` | `relative rounded-[4px] border border-line bg-graphite-2 p-6 sm:p-8` + ticks via `card-ticks` |
| Card (paper) | `card-paper` | `relative rounded-[4px] border border-line-paper bg-paper-2 p-6 sm:p-8` |
| Corner ticks | `card-ticks` | adds the four 10px corner brackets in `currentColor` at 40% — set `text-fg` or `text-pen` on the card |
| Tag | `tag` / `tag-paper` | `font-mono text-[11px] uppercase tracking-[0.14em] rounded-[2px] border px-2 py-1` — square, hairline, never red |
| Status tag (live) | `tag tag-signal` | signal border + text; used for `Playable`, `Up next`, `Live` |
| Button primary | `btn-primary` | hero's pill exactly: `h-12 rounded-full bg-brand-grad px-6 font-mono text-[13.5px] font-bold text-white shadow-glow-brand`, scale hover, signal focus ring |
| Button secondary (dark) | `btn-secondary` | hero's ghost pill: `border-white/20 bg-white/[0.04] text-fg-2 backdrop-blur-md hover:border-white/45 hover:text-fg` |
| Button secondary (paper) | `btn-secondary-paper` | `border-pen/25 text-pen hover:bg-pen hover:text-paper` |
| Divider | `rule` / `rule-paper` | 1px hairline |
| Labelled divider | `rule-label` / `rule-label-paper` | mono label between two hairlines: `—— SINCE 2021 ——` |
| Kicker | `kicker` / `kicker-paper` | LED dot (the red) + `01 / The Club` in 12px mono tracked |
| Dot grid | `grid-dots` | the hero's 24px grid; colour from `--dot`, set by `surface-paper` / default dark |
| Scanlines | `scanlines` | 3px repeating line overlay for Games CRTs |
| Torch mask | `torch` | radial `mask-image` following `--tx/--ty` (Chapter) |
| Section wrapper | `section` | `relative w-full overflow-hidden scroll-mt-20 py-24 md:py-32` |
| Container | `wrap` | `mx-auto w-full max-w-6xl px-4 sm:px-6` |

Icons: bootstrap-icons/lucide are allowed only inline in text (socials, arrows, WhatsApp).
**No icon tiles.** Where a card used to have an icon tile, it now has a mono index (`01`) or a
display letter.

Images: `loading="lazy"`, real `alt`, `object-cover`, max one `<video>` per section
(Footer only, below the hero), never autoplaying under reduced motion.

---

## 5. Motion language

### Easing & timing (shared constants — copy into each file)

```ts
export const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;   // entrances (hero's)
export const EASE_INOUT = [0.77, 0, 0.175, 1] as const;     // state changes, expand/collapse
export const SPRING = { type: 'spring', stiffness: 350, damping: 28 } as const; // pills, toggles, swing (navbar's)
```

| Thing | Duration |
|---|---|
| Entrance (opacity/y:16) | 0.7s `EASE_OUT`, `viewport={{ once: true, amount: 0.4 }}` |
| Stagger | 70ms, max 6 children; after that, no stagger |
| Hover micro (colour, 1.02 scale, tilt) | 180ms |
| State change (accordion, CRT power-on, flip) | 450ms `EASE_INOUT` |
| Scramble | ScrambleIn's own (25ms frames) |
| Loops (LED, scanline, blink) | 2.4s / 6s / 1s; `animation: none` under reduced motion |

### Entrance rule

Per section, **at most two entrance groups**: (1) the header, where the `h2` uses
`ScrambleIn` and the kicker/lede fade; (2) the content block as one unit. Cards do not fade
up individually. Pattern for the h2:

```tsx
const ref = useRef<HTMLHeadingElement>(null);
const inView = useInView(ref, { once: true, amount: 0.6 });
const reduce = useReducedMotion();
<h2 ref={ref} className="...">
  {reduce ? 'Already run by this club.' : <ScrambleIn text="Already run by this club." delay={0} triggered={inView} />}
</h2>
```
Multi-line headings: one `ScrambleIn` per line with delays 0 / 250 / 500, exactly like the hero.

### Scroll-linked

Only the display watermark may be scroll-linked (`useScroll` + `useTransform`, ±40px
parallax). Nothing else moves with scroll. Chapter's torch and Team's swing are
pointer-driven, not scroll-driven.

### The toy per section (the hero scrubs; these are its siblings)

| Section | Toy | Input | Resting state (reduced motion / no pointer) |
|---|---|---|---|
| About | **Lens** over a field of 1,500 dots, one red | pointer / touch position | flat field, red dot static with its label |
| Events | **Rack accordion** — the active pillar widens | hover / tap (one open) | first pillar open |
| Chapter | **Torch** — cursor reveals the key art in full colour through a soft circle | pointer / touch position | art at a fixed 55% brightness |
| Team | **Swing** — badges hang from their punch hole and sway with pointer velocity; drag one | pointermove / drag | straight, still |
| Games | **CRT power-on** — screen is a thin bright line until hovered/in view, then unfolds | hover / in-view | screen on |
| Footer | **Scramble** — the giant wordmark letters scramble under the cursor | hover per word | plain |

Rules for toys: one `pointermove` listener on the section (not per item), `rAF`-throttled,
passive; `touch-action: pan-y` so vertical scroll is never blocked; canvas capped at
`devicePixelRatio ≤ 2` and paused when the section leaves the viewport
(`IntersectionObserver`); `will-change` only on the element that moves; gate everything with
`useReducedMotion()` from framer-motion and `@media (hover: none)` where a hover-only idea
needs a tap equivalent.

### Reduced motion, exactly

- `useReducedMotion()` true → every `whileInView` becomes `{ opacity: [0,1] }` at 0.3s; `ScrambleIn` replaced by plain text; toys in resting state; `<video>` not rendered at all (surface colour stays); loops stopped by the CSS in section 7.

---

## 6. Section-by-section direction

### 01 — About `#club` · paper · "The field manual"

- **Idea:** the lights come on. A printed page: paper, hairline rules, mono margin numbers, generous whitespace, and the first real reading typeface. The visitor arrives knowing NUST, not Hack Club — this is the page of the manual that explains it.
- **Surface/colour:** `paper`, `grid-dots` with the paper dot colour at full strength (it is the ruled paper). Text `pen` tiers. Red: the kicker LED and `text-brand-deep` on "This is the NUST one." Nothing else.
- **Signature element (the toy):** a canvas **field of 1,500 dots** (60 × 25 at a 6px pitch on mobile, up to 14px pitch on desktop), one of them `brand.deep` with a hairline leader to a mono label `NUST · ISLAMABAD · SINCE 2021`. The pointer is a lens: dots within ~80px swell toward 2.5× (inverse-distance), the red one pulses (`animate-led`). Caption under it in mono: `1,500+ clubs. One of them is ours.` This visualises a published figure without inventing geography. Reduced motion: static field.
- **Stats:** four big numerals (`2014 · 100,000 · 1,500+ · 501(c)(3)`) as `Numeral` type resolving via ScrambleIn, separated by `rule-paper`, labels in `pen-3` mono. No count-ups.
- **Principles:** four numbered margin notes `01–04` in two columns; `h3` in mono, body in `font-sans text-pen-2`. No icons, no tiles.
- **Cut:** the icon tiles, the hackclub.com logo line (fold it into a footnote link under the field: `hackclub.com ↗` in `signal.deep`), fade-up on every paragraph.

### 02 — Events `#events` · graphite · "Three doors"

- **Idea:** what the club runs, as a server rack / filing cabinet: the three pillars are three tall panels side by side; the active one is wide and shows its copy, the other two compress to a vertical Anton SC label (`HACKATHONS`, `WORKSHOPS`, `TECH & CYBER`, written sideways with `writing-mode: vertical-rl`). Hover or tap to open; one open at a time; framer-motion `animate={{ flex: active ? 4 : 1 }}` with `EASE_INOUT`. Mobile: stacked rows, tap to expand, first open by default.
- **Surface/colour:** `graphite`, panels `card` + `card-ticks` in `text-fg`. Red: kicker LED and `text-brand` on "tech & cyber." Partners (NCERT, DIGIINN360, Hack The Box, Hackviser) stay in the body copy as words — no logos.
- **Orientation ("Up next"):** a **ticket**. Stub on the left carrying the Minecraft poster (its own greens and sky blue are the colour here), a perforated seam (CSS: `before/after` circles in `graphite` at the top and bottom of the seam plus a dashed `border-l`), body on the right in mono fields: `ADMIT ONE · TUE 6 OCT 2026 · 14:00–17:00 · RIMMS SEMINAR HALL`, `tag tag-signal` reading `Up next`, and `btn-secondary` "See the details →" opening the existing modal. Micro: the ticket tilts ≤ 6° toward the pointer (`rotateX/rotateY` from pointer position, spring). This is a micro, not a second toy.
- **Cut:** the background video and its brand overlay (muddy and expensive), the three identical cards, the red icon tiles, the pulsing red dot.

### 03 — Chapter (record) · ink · "The torch"

- **Idea:** the hero's twin. The Cyber Hackathon key art is full-bleed behind the whole section, desaturated and dimmed to ~25%; the visitor's cursor is a **torch** that reveals it in full colour through a soft 260px circle (`.torch` — a second copy of the image with a radial `mask-image` at `--tx/--ty`, updated from one `pointermove` on the section). This is literally "red as light": the only red in the section comes out of the artwork, and only where the user shines. Touch: the torch follows the finger. Reduced motion / no pointer: the art sits at a fixed 55%.
- **Surface/colour:** `ink` + the art. Content on top in `fg` tiers over a left-to-right gradient scrim (`from-ink via-ink/80 to-transparent`) so body text stays ≥ 4.5:1 regardless of the torch. Display watermark `RECORD` in Anton SC at `opacity-[0.06]` behind the heading.
- **Flagship as a dossier:** kicker `03 / On this campus`, h2 "Already run by this club.", then `The Cyber Hackathon ’26` as `h3`, summary in `font-sans`, and the four facts as **big numerals**: `PKR 275,000` and `PKR 150,000` in `Numeral` type (they are the most impressive sourced facts on the page — let them be big), `Online CTF` and `Up to 5` as labels. Partners as `tag`s. Closing-ceremony line and the Instagram link in `fg-3` with `signal` hover.
- **The record:** a mono ledger — `rule-label` reading `SINCE 2021`, then one row per `RECORD` entry: name in `fg`, `detail` where it exists in `font-sans text-fg-2`, a right-aligned `↗` only on rows that have a source link. Three columns on desktop, one on mobile.
- **Cut:** the solid brand-gradient background, the frosted `bg-ink/35` cards, the pills, the second rounded panel, the vignette-on-red.

### 04 — Team `#team` · paper · "Staff badges"

- **Idea:** six conference **badges hanging from a rail**. Each badge: `card-paper` portrait (≈ 3:4), a punched hole at the top (a `paper` circle with `shadow-inner`), a thin `pen` top bar, the initials in Anton SC at `text-[88px] text-pen` (initials stay — no headshots to go stale), name in mono, role as a `tag-paper`, and `NO. 01`–`06` in `pen-3`. Red: the kicker LED only. The one accent is `signal.deep` on the badge's role line hover.
- **The toy:** badges **swing**. Each has `transformOrigin: '50% 12px'` (the hole) and a `useMotionValue(0)` rotation driven by a `useSpring` (`SPRING`). Pointer velocity across the section nudges each badge's rotation by `clamp(-8, vx * 0.03, 8)` deg with a 40ms stagger left to right so it ripples; a badge is also `drag="x" dragConstraints={{left:0,right:0}} dragElastic={0.3}` and its rotation follows its drag offset, snapping back with the spring. Reduced motion: straight and still. Mobile: a horizontal row you swipe, badges swing with the swipe.
- **Layout:** a top rail (`rule-paper` 2px) across the full container width; badges in a 3-up grid on desktop, a 2-up grid on tablet, an overflow-x row with `snap-x` on mobile.
- **Cut:** the glass cards, the red initials tiles, the `blur-[120px]` glow blob, the hover-to-red role text.

### 05 — Games `#games` · arcade · "Insert coin"

- **Idea:** two arcade cabinets. Each game is a **CRT screen**: `card` on `arcade-2` with `scanlines` overlay, a soft `shadow-glow-signal`, the title in Anton SC `text-signal` with a 1px `text-shadow` glow, the tagline as `tag tag-signal`, and under the screen a bezel strip in mono: `TEXT · CODE · IMAGE  ·  CLUB LEADERBOARD`. Status tag `Playable` in `tag-signal`.
- **The toy:** **power-on**. Offscreen/un-hovered the screen content is `scaleY(0.004)` (a single bright horizontal line of `signal`); on hover or when 60% in view it unfolds with `animate-crt-on` (`scaleY 0.004 → 1.02 → 1`, 450ms `EASE_INOUT`) and a `blink` cursor appears after the description: `PRESS START_`. Two screens power on 120ms apart. Reduced motion: screens on. Touch: on in-view.
- **The red:** `btn-primary` "Play Now" — the arcade's red button, the only red in the section, and it pops precisely because the room is cyan. Full width on mobile, `w-fit` on desktop.
- **Surface:** `arcade`, `grid-dots` dim. Display watermark `PLAY` behind the h2 at `opacity-[0.05]` in `signal`. h2 "Play what we made." left-aligned (the current centred layout is the odd one out — match the other sections).
- **Cut:** the Brain/Music icon tiles, three bordered meta pills (now one mono bezel line), the red hover border and the red glow blob.

### 06 — Footer `#contact` · ink · "Sign-off"

- **Idea:** close the loop with the hero. The footer's bottom edge is a full-width **Anton SC wordmark** `HACK CLUB NUST` at `text-[clamp(64px,13vw,210px)]`, cut by the viewport's bottom edge (`-mb-[0.18em] overflow-hidden`), in `text-fg/[0.08]`, over the existing footer video dimmed to 35% with the hero's vignette. Above it, a three-column mono ledger: left `Hack Club NUST` + the two-line blurb in `font-sans text-fg-2` + `btn-primary` WhatsApp (the section's one red); middle `rule-label FOLLOW` with `FB / IG / IN` handles in mono (`signal` on hover); right `rule-label SITE` with `Club · Events · Team · Games` anchors and `↑ Top`. Bottom line: `© 2026 Hack Club NUST. Built by students, in the open.` in `fg-3`.
- **The toy:** the wordmark's three words each scramble under the cursor using `ScrambleText` (the navbar's hover device). On touch, tapping a word scrambles it once. Reduced motion: plain.
- **Cut:** the 50/50 video split, the brand overlay on the video, the stacked social list with icons.

### Navbar & AnnouncementBar (notes, not a redesign)

- Keep the glass pills, the squash hamburger and the scramble hover — they already speak the system. Add **surface awareness**: an `IntersectionObserver` over `section[data-surface]` sets `data-nav="paper" | "dark"` on the `<nav>`; on paper, pills switch from `bg-white/15 text-white` to `bg-pen/[0.08] text-pen` (the Join pill stays `bg-brand-grad`). Every section sets `data-surface="paper"` or `"dark"` on its `<section>` so this works.
- Nav link labels gain the section index on desktop (`01 Club`) in `font-mono text-[12px] text-fg-3` before the label — the build-log numbering shows up in the one place that is always on screen.
- AnnouncementBar: unchanged in look; it is the temporary solid-red exception and it disappears after 6 October. Keep its `animate-glow`/`animate-sheen` keyframes.

---

## 7. Exact token changes (coordinator applies once, before section work)

### `tailwind.config.js` — replace the whole file

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // body copy below the hero. The hero inherits Space Mono from html/body + App.tsx and is unaffected.
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Space Mono"', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
        display: ['"Anton SC"', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        // surfaces
        ink: '#0B0507',
        graphite: { DEFAULT: '#141316', 2: '#1B1A1E' },
        arcade: { DEFAULT: '#0C1216', 2: '#121A1F' },
        paper: { DEFAULT: '#F2EDE4', 2: '#E9E2D6', 3: '#DCD3C4' },
        // text on dark surfaces
        fg: { DEFAULT: '#F4F1EC', 2: '#A39F99', 3: '#8A857F' },
        // text on paper
        pen: { DEFAULT: '#141114', 2: '#4F4A45', 3: '#6E6861' },
        // hairlines
        line: {
          DEFAULT: 'rgba(244,241,236,0.12)',
          strong: 'rgba(244,241,236,0.24)',
          paper: 'rgba(20,17,20,0.14)',
          'paper-strong': 'rgba(20,17,20,0.32)',
        },
        // the signature, unchanged
        brand: {
          coral: '#F26251',
          DEFAULT: '#ED4A52',
          crimson: '#EB4554',
          deep: '#C9303F',
        },
        // the cool accent
        signal: { DEFAULT: '#58E0D8', deep: '#106B66' },
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #F26251 0%, #EB4554 100%)',
        // left-to-right scrim for text over full-bleed art (Chapter)
        'scrim-x': 'linear-gradient(90deg, #0B0507 0%, rgba(11,5,7,0.82) 45%, rgba(11,5,7,0.2) 100%)',
        // the hero's vignette, reusable
        vignette: 'radial-gradient(ellipse at center, rgba(11,5,7,0.30) 0%, rgba(11,5,7,0.85) 100%)',
      },
      boxShadow: {
        'glow-brand': '0 8px 30px rgba(235,69,84,0.32)',
        led: '0 0 0 3px rgba(237,74,82,0.18), 0 0 12px rgba(237,74,82,0.6)',
        'glow-signal': '0 0 0 1px rgba(88,224,216,0.25), 0 0 40px rgba(88,224,216,0.12)',
      },
      letterSpacing: {
        kicker: '0.22em',
      },
      keyframes: {
        // existing — the announcement bar
        glow: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '60%, 100%': { transform: 'translateX(320%) skewX(-12deg)' },
        },
        // new — shared
        led: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'crt-on': {
          '0%': { transform: 'scaleY(0.004)', opacity: '1', filter: 'brightness(3)' },
          '60%': { transform: 'scaleY(1.02)', filter: 'brightness(1.4)' },
          '100%': { transform: 'scaleY(1)', filter: 'brightness(1)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%': { transform: 'rotate(1.5deg)' },
        },
      },
      animation: {
        glow: 'glow 2.4s ease-in-out infinite',
        sheen: 'sheen 4.5s ease-in-out infinite',
        led: 'led 2.4s ease-in-out infinite',
        blink: 'blink 1s steps(1) infinite',
        scanline: 'scanline 6s linear infinite',
        'crt-on': 'crt-on 450ms cubic-bezier(0.77, 0, 0.175, 1) both',
        sway: 'sway 5s ease-in-out infinite',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        inout: 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
}
```

### `src/index.css`

**(a) Replace line 1 (the Google Fonts import) with:**

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Anton+SC&family=Press+Start+2P&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap');
```

**(b) Replace the `:root { … }` block with:**

```css
:root {
  --font-sans: "Space Mono", monospace;
  --font-serif: "Space Mono", monospace;
  --font-mono: "Space Mono", monospace;
  --font-body: "Space Mono", monospace;
  --font-display: "Space Mono", monospace;

  --brand-coral: #F26251;
  --brand-red: #ED4A52;
  --brand-crimson: #EB4554;
  --brand-deep: #C9303F;
  --ink: #0B0507;
  --graphite: #141316;
  --arcade: #0C1216;
  --paper: #F2EDE4;
  --signal: #58E0D8;
  --signal-deep: #106B66;

  /* per-surface knobs; sections on paper set `surface-paper` to flip them */
  --dot: rgba(244, 241, 236, 0.07);   /* grid dot colour on dark */
  --dot-size: 24px;
  --tick: rgba(244, 241, 236, 0.40);  /* card corner ticks on dark */

  /* torch position for .torch (Chapter); the section updates these on pointermove */
  --tx: 50%;
  --ty: 50%;
  --torch-r: 260px;
}
```

**(c) Add after the `::-webkit-scrollbar-thumb:hover { … }` rule (before the Minecraft block):**

```css
/* one focus ring for the whole site: cool, so it is never confused with the brand */
:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 3px;
}
.surface-paper :focus-visible {
  outline-color: var(--signal-deep);
}

/* reduced motion: stop the shared loops. Sections handle framer-motion via useReducedMotion(). */
@media (prefers-reduced-motion: reduce) {
  .animate-led,
  .animate-blink,
  .animate-scanline,
  .animate-crt-on,
  .animate-sway {
    animation: none !important;
  }
}
```

**(d) Add inside the existing `@layer components { … }` block, before the Minecraft `.mc-panel` rules:**

```css
  /* ------------------------------------------------------------------ */
  /* Shared vocabulary for the sections below the hero. See DESIGN_SYSTEM.md */
  /* ------------------------------------------------------------------ */

  /* layout */
  .section {
    @apply relative w-full overflow-hidden scroll-mt-20 py-24 md:py-32;
  }
  .wrap {
    @apply mx-auto w-full max-w-6xl px-4 sm:px-6;
  }

  /* surface switch: a paper section sets this on its <section> */
  .surface-paper {
    --dot: rgba(20, 17, 20, 0.16);
    --tick: rgba(20, 17, 20, 0.45);
    @apply bg-paper text-pen;
  }

  /* the hero's dot grid, as a layer. Put it on an absolutely-positioned child: */
  /*   <div class="grid-dots pointer-events-none absolute inset-0" />           */
  .grid-dots {
    background-image: radial-gradient(var(--dot) 1px, transparent 1px);
    background-size: var(--dot-size) var(--dot-size);
  }

  /* kicker: the LED dot is where red lives */
  .kicker {
    @apply inline-flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-kicker text-fg-3;
  }
  .kicker::before {
    content: '';
    @apply h-1.5 w-1.5 shrink-0 rounded-full bg-brand shadow-led;
  }
  .kicker-paper {
    @apply inline-flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-kicker text-pen-3;
  }
  .kicker-paper::before {
    content: '';
    @apply h-1.5 w-1.5 shrink-0 rounded-full bg-brand-deep shadow-led;
  }

  /* rules */
  .rule {
    @apply h-px w-full bg-line;
  }
  .rule-paper {
    @apply h-px w-full bg-line-paper;
  }
  .rule-label {
    @apply flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-3;
  }
  .rule-label::before,
  .rule-label::after {
    content: '';
    @apply h-px flex-1 bg-line;
  }
  .rule-label-paper {
    @apply flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-pen-3;
  }
  .rule-label-paper::before,
  .rule-label-paper::after {
    content: '';
    @apply h-px flex-1 bg-line-paper;
  }

  /* cards: square-ish, hairline, viewfinder ticks */
  .card {
    @apply relative rounded-[4px] border border-line bg-graphite-2 p-6 text-fg sm:p-8;
  }
  .card-paper {
    @apply relative rounded-[4px] border border-line-paper bg-paper-2 p-6 text-pen sm:p-8;
  }
  .card-ticks::before,
  .card-ticks::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    pointer-events: none;
    border-color: var(--tick);
    border-style: solid;
  }
  .card-ticks::before {
    top: -1px;
    left: -1px;
    border-width: 1px 0 0 1px;
  }
  .card-ticks::after {
    bottom: -1px;
    right: -1px;
    border-width: 0 1px 1px 0;
  }
  /* the other two corners, via an inner element: <span class="card-ticks-alt" aria-hidden /> */
  .card-ticks-alt::before,
  .card-ticks-alt::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    pointer-events: none;
    border-color: var(--tick);
    border-style: solid;
  }
  .card-ticks-alt::before {
    top: -1px;
    right: -1px;
    border-width: 1px 1px 0 0;
  }
  .card-ticks-alt::after {
    bottom: -1px;
    left: -1px;
    border-width: 0 0 1px 1px;
  }

  /* tags: square, hairline, never red */
  .tag {
    @apply inline-flex items-center rounded-[2px] border border-line px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-3;
  }
  .tag-paper {
    @apply inline-flex items-center rounded-[2px] border border-line-paper px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-pen-2;
  }
  .tag-signal {
    @apply border-signal/50 text-signal;
  }

  /* buttons: pills, like the hero's */
  .btn-primary {
    @apply inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-grad px-6 font-mono text-[13.5px] font-bold text-white shadow-glow-brand transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98];
  }
  .btn-secondary {
    @apply inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 font-mono text-[13.5px] text-fg-2 backdrop-blur-md transition-colors duration-200 hover:border-white/45 hover:text-fg;
  }
  .btn-secondary-paper {
    @apply inline-flex h-12 items-center justify-center gap-2 rounded-full border border-pen/25 bg-transparent px-6 font-mono text-[13.5px] text-pen transition-colors duration-200 hover:border-pen hover:bg-pen hover:text-paper;
  }

  /* CRT scanlines overlay (Games): <div class="scanlines pointer-events-none absolute inset-0" /> */
  .scanlines {
    background-image: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0) 2px,
      rgba(0, 0, 0, 0.28) 2px,
      rgba(0, 0, 0, 0.28) 3px
    );
    mix-blend-mode: multiply;
  }

  /* torch (Chapter): put on the full-colour copy of the art; section updates --tx/--ty */
  .torch {
    -webkit-mask-image: radial-gradient(circle var(--torch-r) at var(--tx) var(--ty), #000 0%, rgba(0, 0, 0, 0.6) 55%, transparent 100%);
    mask-image: radial-gradient(circle var(--torch-r) at var(--tx) var(--ty), #000 0%, rgba(0, 0, 0, 0.6) 55%, transparent 100%);
  }
```

Notes for the coordinator:
- `@apply` with `tracking-kicker`, `shadow-led`, `bg-line`, `text-fg-3` etc. requires the config above to be in place first; apply the config, then the CSS.
- Nothing in these edits touches `html, body` font-family or the hero's classes. The hero keeps rendering exactly as before.
- `.card-ticks` gives two corners via `::before/::after`; the matching two come from one inner `<span class="card-ticks-alt" aria-hidden="true" />`. Both are optional — a plain `.card` is fine for dense lists.

---

## Checklist every section implementer runs before handing in

1. `<section id=… data-surface="dark|paper" className="section [surface-paper] …">` with a `grid-dots` layer and a `wrap` container.
2. Header is `kicker` (with index) → `h2` via `ScrambleIn`+`useInView` → optional `font-sans` lede.
3. Red appears only in: kicker LED, ≤ 1 `btn-primary`, ≤ 1 emphasised phrase. Search your file for `brand` and justify each hit against the list in section 2.
4. No `rounded-2xl`, no `border-white/10`, no `bg-white/[0.02…]`, no icon tiles, no `blur-[` glow blobs.
5. One toy, pointer-driven, `rAF`-throttled, `touch-action: pan-y`, paused offscreen, gated by `useReducedMotion()`.
6. 390px: no horizontal scroll, 16px gutters, toy has a touch or resting equivalent.
7. Body text ≥ 4.5:1 using the tiers above; links have focus rings (they do by default now).
8. Screenshot at 1440 and 390 with `shot.py`; `npx tsc -b` clean for your file.
