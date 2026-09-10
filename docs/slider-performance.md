# Main slider performance

The animation geometry is unchanged: 120 px diagonal spacing, the original
viewport-dependent card dimensions and horizontal shift, the 1,150 ms intro,
sixth-power easing blended into 120 px/s, and the original scene entrance CSS.
The legacy pool-size calculation now only determines the entrance distance.

## Rendering windows

- **Intro:** mount the complete travel corridor before starting (roughly 71–76
  lightweight slides at common sizes, sharing 57 unique preview URLs). No pool
  reconciliation or image replacement occurs during the moving intro. Waiting
  for preview load/decode is bounded by the existing six-second loader timeout.
- **Loop:** intersect horizontal and vertical viewport coverage using the
  rotated card bounds, then add three items on each side. Refresh only when
  fewer than one safety item remains; usually 2–3 new items every 2–3 seconds.
  Large manual jumps bypass the safety check immediately. There is no 60 ms
  throttle that can leave a fast-moving viewport outside the mounted window.
- Keys follow logical slide identity. Retained slides keep their image nodes,
  decode state and opacity transition when the window changes.

Typical mounted loop counts (the exact count varies with fractional scroll):

| Viewport | Mounted slides, including overscan |
| --- | --- |
| 393 × 852 | 13–14 |
| 1264 × 625 | 17–18 |
| 1920 × 1080 | 20–21 |
| 2560 × 1440 | 23–24 |

## Images

Run `pnpm slider:previews` after changing project images. It creates
content-hashed WebP previews (at most 480 × 480, quality 60) and their manifest.
Original portfolio assets and project references are untouched. Unknown images
fall back to the existing Next.js preview optimizer; SVGs remain SVGs.

The current static preview files total about 540 KiB and 33 MiB of decoded RGBA
pixels. The original 58 sequence entries total about 5.7 MiB compressed and
462 MiB decoded. These are asset inventories, not browser/GPU memory readings;
duplicate URLs share cache and the full originals were not all mounted at once.

Full images use Next.js optimization at quality 75, actual card width, and at
most 2x pixel density. For example, a 360 px card on a DPR 3 phone selects the
750 px candidate rather than downloading a 1440–2880 px original. Images near
the viewport upgrade after the intro; previews stay visible through decode and
fade. Slider links disable automatic route prefetch during continuous motion.

## Local verification (2026-09-10)

Production build, Chromium on the development desktop:

- Before: intro frame gaps reached 50–67 ms at 1264 × 625.
- After: first 700 ms of the intro peaked at 16.8 ms on desktop and emulated
  iPhone 15. A 26-second desktop loop sample had no gaps above 25 ms.
- An isolated 30-second mobile-emulation loop sample peaked at 17.2 ms, with
  no gaps above 25 ms. A separate run overlapping screenshot capture did have
  two slower frames; browser tooling can perturb the measurement.
- A final 1920 × 1080 run recording all 69 intro frame gaps peaked at 16.9 ms;
  the first second of the loop, including the pool reduction, peaked at 17.9 ms.
- Checked desktop/mobile rendering, image loading, Discover More, reopening,
  manual scroll and desktop resize. No browser runtime errors were reported.
- Unit tests cover projected viewport bounds (portrait, landscape, tablet,
  desktop, ultrawide), negative/large scrolls, buffer coverage and key retention.

These are local samples, not a guarantee of frame rate on physical mobile
hardware. Cold optimizer responses, network and device GPU still matter.
Use `?sliderProfile=1` and inspect `window.__sliderProfile` to repeat the test:
it records intro gaps, up to 1,800 loop gaps, intro long tasks and pool commits.
The profiler now records the entire intro; the first loop gap includes work
committed at the intro-to-loop transition.
