#!/usr/bin/env python3
"""
Update project carousel video references to optimized variants in projects.json.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


VIDEO_EXTENSIONS = (".mp4", ".mov", ".m4v", ".webm")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Rewrite project carousel video references to optimized variants."
    )
    parser.add_argument("projects_root", help="Path to public/projects")
    parser.add_argument("json_path", help="Path to projects.json")
    parser.add_argument(
        "project_id",
        nargs="?",
        help="Project id to update. Omit when using --all.",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Rewrite video references for every project entry",
    )
    parser.add_argument(
        "--suffix",
        default="-optimized",
        help="Suffix used by the optimized video outputs (default: -optimized)",
    )
    parser.add_argument(
        "--format",
        choices=("mp4", "webm"),
        default="mp4",
        help="Optimized video extension to point at (default: mp4)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned changes without writing the file",
    )
    return parser.parse_args()


def load_projects(json_path: Path) -> dict:
    return json.loads(json_path.read_text())


def save_projects(json_path: Path, data: dict) -> None:
    json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def to_optimized_name(value: str, suffix: str, output_format: str) -> str:
    lower = value.lower()
    for ext in VIDEO_EXTENSIONS:
        if lower.endswith(ext):
            return f"{value[: -len(ext)]}{suffix}.{output_format}"
    return value


def optimized_video_exists(
    projects_root: Path,
    project_id: str,
    optimized_name: str,
) -> bool:
    return (projects_root / project_id / "carousel" / optimized_name).exists()


def update_project_entry(
    projects_root: Path,
    project_id: str,
    project: dict,
    suffix: str,
    output_format: str,
) -> list[tuple[str, str]]:
    carousel = project.get("carousel")
    if not isinstance(carousel, list):
        return []

    updated_values = []
    changes: list[tuple[str, str]] = []
    changed = False

    for value in carousel:
        if not isinstance(value, str):
            updated_values.append(value)
            continue

        optimized_name = to_optimized_name(value, suffix, output_format)
        if (
            optimized_name != value
            and optimized_video_exists(projects_root, project_id, optimized_name)
        ):
            updated_values.append(optimized_name)
            changes.append((value, optimized_name))
            changed = True
        else:
            updated_values.append(value)

    if changed:
        project["carousel"] = updated_values

    return changes


def update_projects(
    projects_root: Path,
    data: dict,
    suffix: str,
    output_format: str,
    project_id: str | None = None,
) -> dict[str, list[tuple[str, str]]]:
    if project_id is not None:
        if project_id not in data:
            raise KeyError(project_id)
        changes = update_project_entry(
            projects_root,
            project_id,
            data[project_id],
            suffix,
            output_format,
        )
        return {project_id: changes} if changes else {}

    changes_by_project: dict[str, list[tuple[str, str]]] = {}
    for current_project_id, project in data.items():
        changes = update_project_entry(
            projects_root,
            current_project_id,
            project,
            suffix,
            output_format,
        )
        if changes:
            changes_by_project[current_project_id] = changes
    return changes_by_project


def print_changes(changes_by_project: dict[str, list[tuple[str, str]]]) -> None:
    for project_id, changes in changes_by_project.items():
        for old, new in changes:
            print(f"{project_id}\tcarousel\t{old}\t->\t{new}")


def main() -> int:
    args = parse_args()
    projects_root = Path(args.projects_root)
    json_path = Path(args.json_path)

    if not projects_root.exists():
        print(f"Projects root not found: {projects_root}", file=sys.stderr)
        return 1
    if not json_path.exists():
        print(f"File not found: {json_path}", file=sys.stderr)
        return 1

    if args.all and args.project_id:
        print("Use either --all or a project_id, not both.", file=sys.stderr)
        return 1
    if not args.all and not args.project_id:
        print("Provide a project_id or use --all.", file=sys.stderr)
        return 1

    data = load_projects(json_path)
    try:
        changes_by_project = update_projects(
            projects_root=projects_root,
            data=data,
            suffix=args.suffix,
            output_format=args.format,
            project_id=None if args.all else args.project_id,
        )
    except KeyError:
        print(f"Project not found: {args.project_id}", file=sys.stderr)
        return 1

    if not changes_by_project:
        print("No video references needed updating.")
        return 0

    print_changes(changes_by_project)

    if args.dry_run:
        print("DRY-RUN\tNo file written.")
        return 0

    save_projects(json_path, data)
    print(f"Updated {json_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
