---
name: media-optimizer
description: Optimize website media assets for web delivery. Use when reducing image weight, converting JPG/JPEG/PNG to WebP, generating responsive image variants, resizing oversized assets, compressing videos for the web, or improving media-heavy page performance while preserving visual quality for product and portfolio content.
---

# Media Optimizer

Optimize media for the web without breaking quality expectations or losing the original source files. Work from the existing project structure, detect the heaviest assets first, and only update code references when the user asks for it or when the task clearly requires wiring new outputs into the app.

## Workflow

1. Scan the relevant media folders and identify large or oversized assets.
2. Classify each asset by type before changing anything.
3. Prefer the bundled bulk script `scripts/optimize_all_projects.py` when the task covers image optimization across the whole `public/projects` tree.
4. Use `scripts/optimize_images.py` as the low-level converter for single folders or targeted image reruns.
5. Use `scripts/optimize_videos.py` for video transcoding because the bulk script currently handles raster images only.
6. Choose the output format and dimensions based on the asset's role on the page.
7. Generate optimized outputs with the same basename as the source whenever possible, changing only the extension to `.webp` for images and using a stable suffix such as `-optimized` for transcoded videos unless replacement in place is explicitly requested.
8. Keep originals unless the user explicitly asks to replace them.
9. When the user wants the optimized assets live on the site, update imports, component props, and source references automatically after conversion.
10. Report before/after file sizes, dimensions, and any code references changed.

## Format Rules

### Images

- Convert `.jpg`, `.jpeg`, and `.png` to `.webp` when it reduces size without unacceptable quality loss.
- Keep `.svg` as `.svg`.
- Preserve transparency-sensitive images if WebP output causes visible issues; prefer quality over blind conversion.
- Preserve visual fidelity for product shots, portfolio pieces, and LCP images.

### Video

- Do not convert normal videos to WebP.
- Produce a web-optimized `.mp4` first.
- Add `.webm` only when the task benefits from it and the extra encode cost is justified.
- Keep playback compatibility and browser delivery in mind when choosing codecs and bitrate targets.

## Sizing Rules

- Resize oversized assets to sensible maximum dimensions for their actual display context.
- Prefer responsive variants when one large source is serving multiple layouts or breakpoints.
- Avoid shipping images substantially larger than their rendered size.
- For LCP assets, prioritize correct dimensions and modern formats over aggressive compression.

## Naming And Output

- Never overwrite originals unless the user explicitly asks for replacement in place.
- Write optimized assets beside the source file or into a clearly named output folder if that matches the project structure better.
- Prefer `image.png -> image.webp` and keep the basename unchanged.
- Use suffixes such as `-desktop`, `-mobile`, or width-based names like `-640`, `-1280`, `-1920` only when multiple variants are required.
- Keep naming consistent across all generated variants so code updates stay predictable.

## Code Updates

- If code references must change, update imports, `srcset` data, image component props, and any hard-coded paths together.
- For this repo structure, prefer the bundled script `scripts/update_project_references.py` to rewrite image references in `src/lib/projects.json`.
- For full-project runs, prefer `scripts/optimize_all_projects.py`, which converts raster images, rewrites references, and removes stale legacy `-optimized.webp` files in one pass.
- Prefer responsive image wiring when the app already supports it.
- Preserve established framework patterns instead of introducing a new image-loading strategy just for one asset.

## Tool Selection

- Prefer project-native tooling when it already exists.
- For routine image conversion, run `scripts/optimize_images.py` before improvising with ad hoc commands.
- Otherwise use reliable local tools available in the environment, such as `ffmpeg`, `cwebp`, ImageMagick, `sharp`, or framework build tooling.
- Verify tool availability before committing to a workflow.
- Choose settings that reduce size materially while keeping the output visually acceptable.

## Script

Use `scripts/optimize_all_projects.py` as the default entrypoint for global raster-image optimization.

Example:

```bash
python3 skills/media-optimizer/scripts/optimize_all_projects.py \
  public/projects \
  src/lib/projects.json \
  --quality 82 \
  --alpha-quality 90 \
  --max-width 2400
```

Behavior:

- Recurse through all project folders under `public/projects`.
- Convert raster images (`.jpg`, `.jpeg`, `.png`) to canonical `.webp` outputs beside the originals.
- Rewrite `image`, `headerImage`, `images`, and `carousel` when `imagesCarousel` is `true`.
- Remove stale legacy files such as `*-optimized.webp` after canonical outputs are ready.
- Keep original raster files on disk.

Use `scripts/optimize_videos.py` for repeatable video transcoding when carousel clips or showcase videos are too large for web delivery.

Example:

```bash
python3 skills/media-optimizer/scripts/optimize_videos.py \
  public/projects/lucrezia-curto/carousel/home.mp4 \
  --format mp4 \
  --crf 24 \
  --preset slow \
  --suffix=-optimized
```

Behavior:

- Accept `.mp4`, `.mov`, `.m4v`, and `.webm` as inputs.
- Write a web-optimized `.mp4` or `.webm` beside the source file without overwriting the original.
- Default to an `-optimized` suffix because the output usually keeps the same container as the source.
- Add `+faststart` for `.mp4` outputs so browser playback can start sooner.
- Optionally resize oversized inputs with `--max-width`.
- Support conservative batch runs with thresholds such as `--min-size-mb`, `--min-bitrate-kbps`, and `--min-reduction-percent`.
- Support `--dry-run` and `--skip-existing`.

Use `scripts/optimize_images.py` for repeatable image conversion on a smaller scope.

Example:

```bash
python3 skills/media-optimizer/scripts/optimize_images.py \
  public/projects/lucrezia-curto \
  --recursive \
  --quality 82 \
  --alpha-quality 90 \
  --max-width 2400 \
  --skip-existing
```

Behavior:

- Convert `.jpg`, `.jpeg`, and `.png` to WebP beside the originals.
- Keep the same basename by default, producing outputs such as `image.webp`.
- Support an optional `--suffix` only when variant naming is needed.
- Keep source files untouched.
- Resize only when `--max-width` is set and the source is wider than that limit.
- Support `--dry-run` to inspect planned outputs before writing files.

Use `scripts/update_project_references.py` when the site should start using the optimized images for one project or for all entries.

Example:

```bash
python3 skills/media-optimizer/scripts/update_project_references.py \
  src/lib/projects.json \
  --all
```

Behavior:

- Rewrite `image`, `headerImage`, and `images` entries from `.png/.jpg/.jpeg` to `.webp`.
- Rewrite `carousel` entries too when `imagesCarousel` is `true`.
- Support either one project id or `--all`.
- Support `--dry-run` before writing.

Use `scripts/update_project_video_references.py` when the site should start using generated `-optimized.mp4` or `-optimized.webm` carousel clips.

Example:

```bash
python3 skills/media-optimizer/scripts/update_project_video_references.py \
  public/projects \
  src/lib/projects.json \
  --all
```

Behavior:

- Rewrite `carousel` entries only when the optimized video file already exists on disk.
- Leave untouched any entries without a matching optimized file.
- Support either one project id or `--all`.
- Support `--dry-run` before writing.

## Validation

- Compare original and optimized file sizes.
- Verify output dimensions and aspect ratio.
- Confirm optimized images still render correctly.
- Confirm optimized videos play correctly in the browser target.
- Note any assets intentionally left unchanged and why.
