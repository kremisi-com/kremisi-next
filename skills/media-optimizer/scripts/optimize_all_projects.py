#!/usr/bin/env python3
"""
Bulk-optimize raster assets in public/projects and rewrite projects.json.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from optimize_images import convert_image, ensure_dependencies, iter_input_files
from update_project_references import (
    load_projects,
    print_changes,
    save_projects,
    update_projects,
)


LEGACY_WEBP_SUFFIXES = ("-optimized",)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Optimize all project raster images and rewrite project references."
    )
    parser.add_argument("projects_root", help="Path to public/projects")
    parser.add_argument("json_path", help="Path to src/lib/projects.json")
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="WebP quality for RGB channels (default: 82)",
    )
    parser.add_argument(
        "--alpha-quality",
        type=int,
        default=90,
        help="WebP quality for alpha channel (default: 90)",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=2400,
        help="Resize images wider than this value before encoding (default: 2400)",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip files whose canonical .webp output already exists",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show planned conversions, reference rewrites, and cleanup without writing",
    )
    return parser.parse_args()


def find_legacy_webps(projects_root: Path) -> list[tuple[Path, Path]]:
    stale: list[tuple[Path, Path]] = []
    for path in sorted(projects_root.rglob("*.webp")):
        for suffix in LEGACY_WEBP_SUFFIXES:
            if path.stem.endswith(suffix):
                canonical_stem = path.stem[: -len(suffix)]
                canonical = path.with_name(f"{canonical_stem}.webp")
                stale.append((path, canonical))
                break
    return stale


def collect_conversion_outputs(results) -> set[Path]:
    return {item.output.resolve() for item in results}


def print_conversion_results(results, dry_run: bool) -> None:
    for item in results:
        prefix = "DRY-RUN-CONVERT" if dry_run else "CONVERT"
        line = (
            f"{prefix}\t{item.source}\t{item.source_width}x{item.source_height}"
            f"\t->\t{item.output}\t{item.output_width}x{item.output_height}"
        )
        if not dry_run:
            reduction = 100 * (1 - (item.output_size / item.source_size))
            line += f"\t{item.source_size}\t{item.output_size}\t{reduction:.1f}%"
        print(line)


def print_cleanup_actions(
    stale_candidates: list[tuple[Path, Path]],
    planned_outputs: set[Path],
    dry_run: bool,
) -> list[Path]:
    removable: list[Path] = []
    prefix = "DRY-RUN-DELETE" if dry_run else "DELETE"
    for legacy, canonical in stale_candidates:
        canonical_ready = canonical.resolve() in planned_outputs or canonical.exists()
        if canonical_ready:
            removable.append(legacy)
            print(f"{prefix}\t{legacy}\t->\t{canonical}")
    return removable


def main() -> int:
    args = parse_args()
    projects_root = Path(args.projects_root)
    json_path = Path(args.json_path)

    if not projects_root.exists():
        print(f"Projects root not found: {projects_root}", file=sys.stderr)
        return 1
    if not json_path.exists():
        print(f"JSON file not found: {json_path}", file=sys.stderr)
        return 1

    ensure_dependencies()

    source_files = iter_input_files([str(projects_root)], recursive=True)
    if not source_files:
        print("No raster project images found.", file=sys.stderr)
        return 1

    conversion_results = []
    for source in source_files:
        result = convert_image(
            source=source,
            quality=args.quality,
            alpha_quality=args.alpha_quality,
            max_width=args.max_width,
            suffix="",
            dry_run=args.dry_run,
            skip_existing=args.skip_existing,
        )
        if result is not None:
            conversion_results.append(result)

    print_conversion_results(conversion_results, args.dry_run)

    data = load_projects(json_path)
    changes_by_project = update_projects(data, project_id=None)
    if changes_by_project:
        print_changes(changes_by_project)
        if not args.dry_run:
            save_projects(json_path, data)
            print(f"UPDATED\t{json_path}")
    else:
        print("No image references needed updating.")

    planned_outputs = collect_conversion_outputs(conversion_results)
    stale_candidates = find_legacy_webps(projects_root)
    removable = print_cleanup_actions(stale_candidates, planned_outputs, args.dry_run)

    if not args.dry_run:
        for path in removable:
            path.unlink()

    print(
        "SUMMARY\t"
        f"converted={len(conversion_results)}\t"
        f"projects_changed={len(changes_by_project)}\t"
        f"legacy_deleted={len(removable)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
