#!/usr/bin/env python3
"""
Convert JPEG/PNG images to WebP without overwriting originals.

This script relies on macOS `sips` for dimensions and Google's `cwebp`
for encoding so it can run without extra Python dependencies.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


@dataclass
class ImageResult:
    source: Path
    output: Path
    source_size: int
    output_size: int
    source_width: int
    source_height: int
    output_width: int
    output_height: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert JPG/JPEG/PNG files to WebP beside the originals."
    )
    parser.add_argument("paths", nargs="+", help="Files or directories to process")
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
        default=None,
        help="Resize images wider than this value before encoding",
    )
    parser.add_argument(
        "--suffix",
        default="",
        help="Optional suffix added before the .webp extension (default: none)",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Recurse into directories",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be converted without writing files",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip files whose output already exists",
    )
    return parser.parse_args()


def ensure_dependencies() -> None:
    missing = [tool for tool in ("cwebp", "sips") if shutil.which(tool) is None]
    if missing:
        joined = ", ".join(missing)
        raise SystemExit(f"Missing required tools: {joined}")


def iter_input_files(paths: list[str], recursive: bool) -> list[Path]:
    files: list[Path] = []
    for raw_path in paths:
        path = Path(raw_path)
        if not path.exists():
            raise SystemExit(f"Path not found: {path}")
        if path.is_file():
            if path.suffix.lower() in SUPPORTED_EXTENSIONS:
                files.append(path)
            continue
        walker = path.rglob("*") if recursive else path.glob("*")
        for child in walker:
            if child.is_file() and child.suffix.lower() in SUPPORTED_EXTENSIONS:
                files.append(child)
    return sorted(set(files))


def get_dimensions(path: Path) -> tuple[int, int]:
    proc = subprocess.run(
        ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
        capture_output=True,
        text=True,
        check=True,
    )
    width = height = None
    for line in proc.stdout.splitlines():
        line = line.strip()
        if line.startswith("pixelWidth:"):
            width = int(line.split(":", 1)[1].strip())
        elif line.startswith("pixelHeight:"):
            height = int(line.split(":", 1)[1].strip())
    if width is None or height is None:
        raise RuntimeError(f"Unable to read dimensions for {path}")
    return width, height


def output_dimensions(width: int, height: int, max_width: int | None) -> tuple[int, int]:
    if not max_width or width <= max_width:
        return width, height
    scaled_height = max(1, round(height * (max_width / width)))
    return max_width, scaled_height


def build_output_path(source: Path, suffix: str) -> Path:
    return source.with_name(f"{source.stem}{suffix}.webp")


def convert_image(
    source: Path,
    quality: int,
    alpha_quality: int,
    max_width: int | None,
    suffix: str,
    dry_run: bool,
    skip_existing: bool,
) -> ImageResult | None:
    source_width, source_height = get_dimensions(source)
    out_width, out_height = output_dimensions(source_width, source_height, max_width)
    output = build_output_path(source, suffix)

    if skip_existing and output.exists():
        return None

    if dry_run:
        return ImageResult(
            source=source,
            output=output,
            source_size=source.stat().st_size,
            output_size=0,
            source_width=source_width,
            source_height=source_height,
            output_width=out_width,
            output_height=out_height,
        )

    command = [
        "cwebp",
        "-quiet",
        "-q",
        str(quality),
        "-alpha_q",
        str(alpha_quality),
        "-mt",
    ]
    if (out_width, out_height) != (source_width, source_height):
        command.extend(["-resize", str(out_width), str(out_height)])
    command.extend([str(source), "-o", str(output)])
    subprocess.run(command, check=True)

    return ImageResult(
        source=source,
        output=output,
        source_size=source.stat().st_size,
        output_size=output.stat().st_size,
        source_width=source_width,
        source_height=source_height,
        output_width=out_width,
        output_height=out_height,
    )


def main() -> int:
    args = parse_args()
    ensure_dependencies()
    files = iter_input_files(args.paths, args.recursive)
    if not files:
        print("No supported input files found.", file=sys.stderr)
        return 1

    results: list[ImageResult] = []
    for source in files:
        result = convert_image(
            source=source,
            quality=args.quality,
            alpha_quality=args.alpha_quality,
            max_width=args.max_width,
            suffix=args.suffix,
            dry_run=args.dry_run,
            skip_existing=args.skip_existing,
        )
        if result is not None:
            results.append(result)

    if not results:
        print("Nothing to do.")
        return 0

    total_source = sum(item.source_size for item in results)
    total_output = sum(item.output_size for item in results)

    for item in results:
        if args.dry_run:
            print(
                f"DRY-RUN\t{item.source}\t{item.source_width}x{item.source_height}"
                f"\t->\t{item.output}\t{item.output_width}x{item.output_height}"
            )
            continue
        reduction = 100 * (1 - (item.output_size / item.source_size))
        print(
            f"{item.source}\t{item.source_width}x{item.source_height}\t{item.source_size}"
            f"\t->\t{item.output}\t{item.output_width}x{item.output_height}\t"
            f"{item.output_size}\t{reduction:.1f}%"
        )

    if not args.dry_run:
        reduction = 100 * (1 - (total_output / total_source))
        print(f"TOTAL\t{total_source}\t->\t{total_output}\t{reduction:.1f}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
