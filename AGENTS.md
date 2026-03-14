# Media rules

When working on frontend assets:

- Convert raster images (.jpg, .jpeg, .png) to .webp when beneficial.
- Keep SVG as SVG.
- Do not convert videos to WebP unless explicitly requested for animation-like use cases.
- For videos, create web-optimized MP4 and optionally WebM versions.
- Preserve visual quality for product/portfolio images.
- Prefer responsive images and avoid oversized assets.
- For LCP images, prioritize modern formats and correct dimensions.
- If changing image references in code, update imports/components accordingly.

When creating or updating a project under `public/projects` and `src/lib/projects.json`:

- Optimize images before wiring the new project live. In this repo, prefer `python3 skills/media-optimizer/scripts/optimize_images.py <project-folder> --recursive --skip-existing`.
- Keep canonical image names in `projects.json`, pointing to `.webp` outputs when they replace `.png/.jpg/.jpeg`.
- Optimize new carousel or showcase videos before wiring them live. In this repo, prefer `python3 skills/media-optimizer/scripts/optimize_videos.py <file-or-folder> --format mp4 --suffix=-optimized --skip-existing`.
- Use conservative video settings to avoid unnecessary double compression. Prefer keeping the original when the optimized output is not materially smaller or looks worse.
- When optimized video files are kept, point `carousel` entries in `src/lib/projects.json` to the generated `-optimized.mp4` files.
- Do not finish a new project integration with raw unoptimized raster images or oversized source videos if local optimization is possible.
