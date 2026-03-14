#!/usr/bin/env python3
"""
Transcode videos to web-optimized MP4 or WebM outputs without overwriting originals.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


SUPPORTED_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm"}


@dataclass
class VideoMetadata:
    width: int
    height: int
    duration: float
    size: int
    video_codec: str
    has_audio: bool


@dataclass
class VideoResult:
    source: Path
    output: Path
    source_size: int
    output_size: int
    source_width: int
    source_height: int
    output_width: int
    output_height: int
    duration: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcode videos to web-optimized MP4 or WebM outputs."
    )
    parser.add_argument("paths", nargs="+", help="Files or directories to process")
    parser.add_argument(
        "--format",
        choices=("mp4", "webm"),
        default="mp4",
        help="Output container and codec family (default: mp4)",
    )
    parser.add_argument(
        "--crf",
        type=int,
        default=24,
        help="Constant quality target for video encoding (default: 24)",
    )
    parser.add_argument(
        "--preset",
        default="slow",
        help="Encoder preset (default: slow)",
    )
    parser.add_argument(
        "--audio-bitrate",
        default="128k",
        help="Audio bitrate for encoded outputs (default: 128k)",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=None,
        help="Resize videos wider than this value before encoding",
    )
    parser.add_argument(
        "--suffix",
        default="-optimized",
        help="Suffix added before the output extension (default: -optimized)",
    )
    parser.add_argument(
        "--min-size-mb",
        type=float,
        default=0.0,
        help="Skip files smaller than this size in MB (default: 0)",
    )
    parser.add_argument(
        "--min-bitrate-kbps",
        type=int,
        default=0,
        help="Skip files whose average bitrate is below this value (default: 0)",
    )
    parser.add_argument(
        "--min-reduction-percent",
        type=float,
        default=0.0,
        help="Delete outputs whose size reduction is below this percentage (default: 0)",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Recurse into directories",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show planned outputs without writing files",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip files whose output already exists",
    )
    parser.add_argument(
        "--keep-if-larger",
        action="store_true",
        help="Keep outputs even when they are not smaller than the source",
    )
    return parser.parse_args()


def ensure_dependencies() -> None:
    missing = [tool for tool in ("ffmpeg", "ffprobe") if shutil.which(tool) is None]
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


def probe_video(path: Path) -> VideoMetadata:
    proc = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration,size",
            "-show_streams",
            "-of",
            "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    payload = json.loads(proc.stdout)
    streams = payload.get("streams", [])
    video_stream = next((stream for stream in streams if stream.get("codec_type") == "video"), None)
    if video_stream is None:
        raise RuntimeError(f"No video stream found in {path}")

    audio_stream = next((stream for stream in streams if stream.get("codec_type") == "audio"), None)
    format_info = payload.get("format", {})

    return VideoMetadata(
        width=int(video_stream["width"]),
        height=int(video_stream["height"]),
        duration=float(format_info["duration"]),
        size=int(format_info["size"]),
        video_codec=str(video_stream.get("codec_name", "unknown")),
        has_audio=audio_stream is not None,
    )


def make_even(value: int) -> int:
    return value if value % 2 == 0 else max(2, value - 1)


def output_dimensions(width: int, height: int, max_width: int | None) -> tuple[int, int]:
    if max_width is None or width <= max_width:
        return make_even(width), make_even(height)

    ratio = max_width / width
    out_width = make_even(max_width)
    out_height = make_even(round(height * ratio))
    return out_width, out_height


def build_output_path(source: Path, suffix: str, output_format: str) -> Path:
    return source.with_name(f"{source.stem}{suffix}.{output_format}")


def build_ffmpeg_command(
    source: Path,
    output: Path,
    output_format: str,
    crf: int,
    preset: str,
    audio_bitrate: str,
    dimensions: tuple[int, int],
    source_dimensions: tuple[int, int],
    has_audio: bool,
) -> list[str]:
    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(source),
        "-map",
        "0:v:0",
    ]
    if has_audio:
        command.extend(["-map", "0:a:0"])

    if dimensions != source_dimensions:
        command.extend(["-vf", f"scale={dimensions[0]}:{dimensions[1]}"])

    if output_format == "mp4":
        command.extend(
            [
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-preset",
                preset,
                "-crf",
                str(crf),
            ]
        )
        if has_audio:
            command.extend(["-c:a", "aac", "-b:a", audio_bitrate])
        command.extend(["-movflags", "+faststart"])
    else:
        command.extend(
            [
                "-c:v",
                "libvpx-vp9",
                "-b:v",
                "0",
                "-crf",
                str(crf),
                "-row-mt",
                "1",
                "-deadline",
                "good",
            ]
        )
        if has_audio:
            command.extend(["-c:a", "libopus", "-b:a", audio_bitrate])

    command.append(str(output))
    return command


def convert_video(
    source: Path,
    output_format: str,
    crf: int,
    preset: str,
    audio_bitrate: str,
    max_width: int | None,
    suffix: str,
    min_size_mb: float,
    min_bitrate_kbps: int,
    min_reduction_percent: float,
    keep_if_larger: bool,
    dry_run: bool,
    skip_existing: bool,
) -> VideoResult | None:
    metadata = probe_video(source)
    output = build_output_path(source, suffix, output_format)

    if skip_existing and output.exists():
        return None
    if metadata.size < int(min_size_mb * 1024 * 1024):
        return None
    if metadata.duration > 0:
        bitrate_kbps = int((metadata.size * 8) / metadata.duration / 1000)
        if bitrate_kbps < min_bitrate_kbps:
            return None

    out_width, out_height = output_dimensions(
        metadata.width,
        metadata.height,
        max_width,
    )

    if dry_run:
        return VideoResult(
            source=source,
            output=output,
            source_size=metadata.size,
            output_size=0,
            source_width=metadata.width,
            source_height=metadata.height,
            output_width=out_width,
            output_height=out_height,
            duration=metadata.duration,
        )

    command = build_ffmpeg_command(
        source=source,
        output=output,
        output_format=output_format,
        crf=crf,
        preset=preset,
        audio_bitrate=audio_bitrate,
        dimensions=(out_width, out_height),
        source_dimensions=(metadata.width, metadata.height),
        has_audio=metadata.has_audio,
    )
    subprocess.run(command, check=True)

    output_size = output.stat().st_size
    reduction_percent = 100 * (1 - (output_size / metadata.size))
    if reduction_percent < min_reduction_percent and not keep_if_larger:
        output.unlink()
        return None
    if output_size >= metadata.size and not keep_if_larger:
        output.unlink()
        return None

    return VideoResult(
        source=source,
        output=output,
        source_size=metadata.size,
        output_size=output_size,
        source_width=metadata.width,
        source_height=metadata.height,
        output_width=out_width,
        output_height=out_height,
        duration=metadata.duration,
    )


def main() -> int:
    args = parse_args()
    ensure_dependencies()
    files = iter_input_files(args.paths, args.recursive)
    if not files:
        print("No supported input videos found.", file=sys.stderr)
        return 1

    results: list[VideoResult] = []
    for source in files:
        result = convert_video(
            source=source,
            output_format=args.format,
            crf=args.crf,
            preset=args.preset,
            audio_bitrate=args.audio_bitrate,
            max_width=args.max_width,
            suffix=args.suffix,
            min_size_mb=args.min_size_mb,
            min_bitrate_kbps=args.min_bitrate_kbps,
            min_reduction_percent=args.min_reduction_percent,
            keep_if_larger=args.keep_if_larger,
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
                f"\t{item.duration:.2f}s"
            )
            continue
        reduction = 100 * (1 - (item.output_size / item.source_size))
        print(
            f"{item.source}\t{item.source_width}x{item.source_height}\t{item.source_size}"
            f"\t->\t{item.output}\t{item.output_width}x{item.output_height}\t"
            f"{item.output_size}\t{item.duration:.2f}s\t{reduction:.1f}%"
        )

    if not args.dry_run:
        reduction = 100 * (1 - (total_output / total_source))
        print(f"TOTAL\t{total_source}\t->\t{total_output}\t{reduction:.1f}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
