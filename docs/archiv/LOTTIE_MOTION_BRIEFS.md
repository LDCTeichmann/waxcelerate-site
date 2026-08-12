# Waxcelerate — Lottie/Rive Motion Briefs

Three animations for the "Was Waxcelerate anders macht" section.
Each replaces its corresponding inline SVG diagram.

Tool recommendation: **LottieFiles** (lottiefiles.com) for simple looping animations.
If you want interactive states (hover, click), use **Rive** (rive.app) instead.

Integration after export:
```bash
npm install lottie-react
```
Then in the component:
```tsx
import Lottie from 'lottie-react';
import crystalAnim from '@/animations/crystal-coverage.json';
<Lottie animationData={crystalAnim} loop autoplay style={{ width: 280 }} />
```

---

## Animation 01 — Crystal Coverage (Strip 1: "Kein Rost nach der Regenfahrt")

**File name:** `crystal-coverage.json`
**Canvas:** 280 × 160 px
**Duration:** 4 seconds, seamless loop
**Framerate:** 30 fps

### Scene layout
Two panels side by side, divided by a 1px vertical line at x=137.

**Left panel label** (x=0–137): "Standard-Paraffin" — 7px, semibold, muted color (#8080A0), centered at top.
**Right panel label** (x=143–280): "Mikrokristallin" — same style.

### Background
Both panels: `#1C1C1F` (dark card surface color)

### Left panel — coarse paraffin crystals

**Static elements:**
- 4 large triangular crystal shapes (peak pointing up), each ~22px wide at base, ~42px tall
- Positioned at: x=8, x=42, x=70, x=96 (overlapping slightly)
- Fill: `#262630`, stroke: `#333344` at 0.8px
- Between crystals: visible V-shaped gaps ~4px wide at base
- Metal surface: a horizontal bar at y=130, height 26px, fill `#18181B`, top edge line `#27272A` at 3px

**Animated element — water droplet (LEFT):**
Shape: rounded teardrop. 8px wide, 11px tall including tip.
Fill: `#4A90D9`, opacity 0.85.

Timeline:
- `0:00–0:01.0` — Hold at y=80 (above crystals), x=70
- `0:01.0–0:01.8` — Ease-in fall: y=80 → y=130 (falls through the gap between crystals 2 and 3)
- `0:01.8–0:02.0` — Opacity fades to 0 (disappeared into metal)
- `0:02.0–0:03.0` — Hold at opacity 0
- `0:03.0–0:03.2` — Reappear instantly at y=80, opacity back to 0.85
- `0:03.2–0:04.0` — Hold (loop prep)

**Animated element — rust dot (LEFT):**
Circle, 5px radius, fill `#C0392B`, positioned at x=70, y=133 (on metal surface).

Timeline:
- `0:00–0:01.8` — scale 0, opacity 0
- `0:01.8–0:02.2` — scale 0→1.2 (overshoot), opacity 0→1 (ease-out)
- `0:02.2–0:02.4` — scale 1.2→1.0, opacity 1 (settle)
- `0:02.4–0:03.0` — Hold visible
- `0:03.0–0:03.2` — Opacity 1→0 (fade out, reset)
- `0:03.2–0:04.0` — Hold invisible

**Static badge LEFT:** Red ✗ pill, 16×10px, top-left of panel, fill `rgba(192,57,43,0.15)`, text `#C0392B`.

### Right panel — fine microcrystalline crystals

**Static elements:**
- 9 narrow triangular crystal shapes, each ~13px wide, ~22px tall — densely packed with no gaps
- Two rows slightly offset to fill all space visually
- Fill: `#262630`, stroke: `#333344` at 0.5px
- Same metal surface bar at y=130

**Animated element — water droplet (RIGHT):**
Same shape as left. Starts at x=213, y=80.

Timeline:
- `0:00–0:00.8` — Hold at y=80
- `0:00.8–0:01.3` — Fall to y=108 (reaches crystal surface, does NOT pass through)
- `0:01.3–0:01.8` — Slide diagonally: y=108→y=100, x=213→x=198 (bounces/slides off surface)
- `0:01.8–0:02.0` — Opacity 0.85→0 (droplet exits frame left, implying runoff)
- `0:02.0–0:03.2` — Hold at opacity 0
- `0:03.2–0:03.5` — Reappear at original position y=80
- `0:03.5–0:04.0` — Hold

**No rust dot appears on right side** — the absence is the point. Optionally: a subtle green checkmark pulse at the metal surface at t=2.0.

**Static badge RIGHT:** Blue ✓ pill, 16×10px, top-left of right panel, fill `rgba(43,82,176,0.15)`, text `#3D67CA`.

---

## Animation 02 — Temperature Range (Strip 2: "Keine Schaltprobleme unter Null")

**File name:** `temp-range.json`
**Canvas:** 280 × 160 px
**Duration:** 3.5 seconds, seamless loop
**Framerate:** 30 fps

### Scene layout
Single panel. Scale bar across the middle.

**Temperature label LEFT:** "−15 °C" — 8px, semibold, `#5A5A66`, x=20, y=22
**Temperature label RIGHT:** "+45 °C" — same, right-aligned at x=260
**Zero marker:** "0°" — 8px, `#71717A`, centered at x=80 (proportional position of 0°C in the range)

**Zero line:** Vertical dashed line at x=80, y=26–150, stroke `#27272A`, 0.8px, dasharray 3,3

### Main bars (y positions: 65 and 88)

**Bar 1 — Standard wax zone:**
Track: x=20, y=65, width=240, height=18, rx=9, fill `#1C1C1F`

Working range fill: starts at x=93 (5°C mark), width=167, height=18, fill `#27272A`
Frozen zone fill: x=20, width=73, height=18, rx=9, fill `rgba(192,57,43,0.20)`

**Bar 2 — Waxcelerate Pro zone:**
Track: x=48, y=88, width=212, height=18, rx=9, fill `rgba(43,82,176,0.25)`
Active glow region (−8°C to 0°C): x=48, width=32, height=18, fill `rgba(61,103,202,0.55)`

Animation on active glow:
- Pulse in opacity: `0:00–0:01.75` sine wave 0.4→0.9→0.4 (one breath per 3.5s)
- Subtle width breathing: width 32→36→32 over same period, easing: sine

**Bar 1 label (on frozen zone):** "verhärtet" — 7px, `rgba(192,57,43,0.8)`, x=22, y=78
**Bar 2 label:** "Pro — flexibel ab" — 7px, `#5B8BED`, x=50, y=101

### Temperature bracket (y=113–130)

Horizontal line: x=48 to x=80, y=120, stroke `#3D67CA`, 1px
Left tick: x=48, y=117–123, same stroke
Right tick: x=80, y=117–123, same stroke
Label: "−8 °C" — 7.5px bold, `#3D67CA`, centered between ticks at y=130

### Chain-link icon (top-left, above frozen zone)

Two overlapping rounded rectangles forming a chain link, 20×16px total.
Stroke: `rgba(192,57,43,0.6)`, 2px, fill none.
Position: x=20, y=30

**Freeze-shake animation (loop, subtle):**
- `0:00–0:00.5` — static
- `0:00.5–0:00.7` — x shift: 0 → −2px (jolt left)
- `0:00.7–0:00.9` — x shift: −2 → +2px
- `0:00.9–0:01.1` — x shift: +2 → −1px
- `0:01.1–0:01.3` — x shift: −1 → 0
- `0:01.3–0:03.5` — static hold (long pause, then loop)

### Legend (bottom of canvas, y=148)

Two small 8×8px squares:
- x=20: fill `rgba(192,57,43,0.22)` + label "Standard-Wachs" — 7px, `#71717A`
- x=148: fill `rgba(43,82,176,0.40)` + label "Pro (MoS₂)" — 7px, `#71717A`

---

## Animation 03 — Wax Shedding (Strip 3: "Kein Shedding in der Sommerhitze")

**File name:** `wax-shedding.json`
**Canvas:** 280 × 160 px
**Duration:** 3 seconds, seamless loop
**Framerate:** 30 fps

### Scene layout
Two panels, same as Animation 01.

**Left panel label:** "Weiches Wachs" — 7px semibold, muted
**Right panel label:** "Härtere Matrix" — same

### Left panel — wax migrating off chain

**Static chain-link outline:**
Rounded rectangle 86×50px, rx=25, x=24, y=52, stroke `#27272A` 3px, fill none.
Inner cutout: 60×26px, rx=13, same stroke 1.5px.

**Static wax coating layer:**
Top cap: rect 86×6px, rx=3, x=24, y=49, fill `rgba(180,160,80,0.30)` — represents thin/depleting wax
Bottom cap: same at y=95

**Three animated wax droplets — staggered:**

All droplets: rounded teardrop shape, 7px wide × 10px tall body + 8px pointed tip.
Fill: `rgba(200,170,60,0.70)`.

**Droplet A** (x=48):
- `0:00–0:00.3` — Hold, scale=1 at chain surface (y=102)
- `0:00.3–0:00.9` — Ease-in fall: y=102→y=130, slight x drift +2px
- `0:00.9–0:01.1` — Opacity 1→0
- `0:01.1–0:03.0` — Hold invisible, reset to y=102 at t=2.8

**Droplet B** (x=67), delay +0.9s:
- Same motion, starts at `0:00.9`

**Droplet C** (x=87), delay +1.7s:
- Same motion, starts at `0:01.7`

**Three dirt particles — appear after wax leaves:**

Circles, 3–4px radius, fill `rgba(100,80,50,0.65)`.
Positions: x=40,y=56 / x=67,y=54 / x=90,y=57

Each particle:
- Scale 0, opacity 0 initially
- At t = (droplet's contact time + 0.2s): scale 0→1 with ease-out bounce, opacity 0→1
- Hold for remainder of loop, then snap back to invisible at loop reset

**Time label at bottom:** "nach 40 km · 28 °C" — 7px, `#5A5A66`, centered

**✗ badge:** Same as Animation 01 left panel.

### Right panel — wax stays solid

**Static chain-link outline:** Same geometry, shifted to x=170.

**Static wax coating — solid, thicker, no drips:**
Top band: 86×8px, rx=4, x=170, y=48, fill `rgba(61,103,202,0.32)`
Bottom band: same at y=94
Left edge: 8×38px, rx=4, x=170, y=56, fill `rgba(61,103,202,0.20)`
Right edge: same at x=248

**No droplets, no dirt.**

**Subtle "steady" indicator animation:**
A soft radial glow at the chain center (cx=213, cy=77):
- `0:00–0:03.0` — slow opacity pulse 0.08→0.18→0.08, radius 14→18→14, fill `rgba(61,103,202,0.6)`
- This communicates stability without text

**Center text:** "kein Shedding" — 7.5px, `rgba(61,103,202,0.70)`, centered at y=80

**Time label:** "nach 400 km · 28 °C" — 7px, `#5A5A66`, centered

**✓ badge:** Same as Animation 01 right panel.

---

## Integration checklist

After exporting all three `.json` files:

1. Place files at: `waxcelerate-site/src/animations/`
   - `crystal-coverage.json`
   - `temp-range.json`
   - `wax-shedding.json`

2. Install: `npm install lottie-react`

3. In `why-wax.tsx`, replace each `<CrystalDiagram />`, `<TempDiagram />`, `<SheddingDiagram />`
   with the Lottie component:

```tsx
import Lottie from 'lottie-react';
import crystalAnim   from '@/animations/crystal-coverage.json';
import tempAnim      from '@/animations/temp-range.json';
import sheddingAnim  from '@/animations/wax-shedding.json';

// Replace CrystalDiagram:
<Lottie animationData={crystalAnim} loop autoplay
  style={{ width: '100%', maxWidth: 280, display: 'block' }} />

// Replace TempDiagram:
<Lottie animationData={tempAnim} loop autoplay
  style={{ width: '100%', maxWidth: 280, display: 'block' }} />

// Replace SheddingDiagram:
<Lottie animationData={sheddingAnim} loop autoplay
  style={{ width: '100%', maxWidth: 280, display: 'block' }} />
```

4. The diagram wrapper div in `MechanismStrip` already handles the border/background.
   Set Lottie's own background to transparent (it is by default).

5. For `prefers-reduced-motion` compliance, check the media query and pass
   `autoplay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches}` to each Lottie.

---

## Color reference (match the site design system)

| Purpose | Light mode | Dark mode (.noir) |
|---|---|---|
| Panel background | `#ECECF0` (--sf2) | `#1C1C1F` (--sf2) |
| Crystal fill | `#E4E4EA` (--sf3) | `#17171A` (--card-from) |
| Border/outline | `#D8D8E0` (--bd) | `#27272A` (--bd) |
| Brand blue | `#3D67CA` | `#3D67CA` |
| Muted text | `#6E7288` (--txm) | `#71717A` (--txm) |
| Faint text | `#8080A0` (--txff) | `#5A5A66` (--txff) |

The SVG diagrams in the current code use CSS variables (`var(--sf2)`, `var(--bd)` etc.)
so they adapt to light/dark automatically. Lottie animations are static JSON —
you'll need to decide: export for **dark mode only** (the site defaults to dark for most users)
or export two versions and swap based on the `noir` class on `<html>`.

Simplest approach: export for dark mode values. The fallback inline SVG already adapts.
