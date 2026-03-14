#!/usr/bin/env python3
"""
Update project image references from raster formats to .webp in projects.json.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


IMAGE_FIELDS = ("image", "headerImage")
IMAGE_ARRAY_FIELDS = ("images",)
RASTER_EXTENSIONS = (".png", ".jpg", ".jpeg")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Rewrite project image references to .webp in projects.json."
    )
    parser.add_argument("json_path", help="Path to projects.json")
    parser.add_argument(
        "project_id",
        nargs="?",
        help="Project id to update. Omit when using --all.",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Rewrite image references for every project entry",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned changes without writing the file",
    )
    return parser.parse_args()


def to_webp_name(value: str) -> str:
    lower = value.lower()
    for ext in RASTER_EXTENSIONS:
        if lower.endswith(ext):
            return value[: -len(ext)] + ".webp"
    return value


def load_projects(json_path: Path) -> dict:
    return json.loads(json_path.read_text())


def save_projects(json_path: Path, data: dict) -> None:
    json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def update_string_list(
    project: dict,
    field: str,
    changes: list[tuple[str, str, str]],
) -> None:
    values = project.get(field)
    if not isinstance(values, list):
        return

    updated_values = []
    field_changed = False
    for value in values:
        if not isinstance(value, str):
            updated_values.append(value)
            continue
        updated = to_webp_name(value)
        updated_values.append(updated)
        if updated != value:
            changes.append((field, value, updated))
            field_changed = True

    if field_changed:
        project[field] = updated_values


def update_project_entry(project: dict) -> list[tuple[str, str, str]]:
    changes: list[tuple[str, str, str]] = []

    for field in IMAGE_FIELDS:
        value = project.get(field)
        if isinstance(value, str):
            updated = to_webp_name(value)
            if updated != value:
                project[field] = updated
                changes.append((field, value, updated))

    for field in IMAGE_ARRAY_FIELDS:
        update_string_list(project, field, changes)

    if project.get("imagesCarousel"):
        update_string_list(project, "carousel", changes)

    return changes


def update_projects(
    data: dict,
    project_id: str | None = None,
) -> dict[str, list[tuple[str, str, str]]]:
    if project_id is not None:
        if project_id not in data:
            raise KeyError(project_id)
        changes = update_project_entry(data[project_id])
        return {project_id: changes} if changes else {}

    changes_by_project: dict[str, list[tuple[str, str, str]]] = {}
    for current_project_id, project in data.items():
        changes = update_project_entry(project)
        if changes:
            changes_by_project[current_project_id] = changes
    return changes_by_project


def print_changes(changes_by_project: dict[str, list[tuple[str, str, str]]]) -> None:
    for project_id, changes in changes_by_project.items():
        for field, old, new in changes:
            print(f"{project_id}\t{field}\t{old}\t->\t{new}")


def main() -> int:
    args = parse_args()
    json_path = Path(args.json_path)
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
            data,
            project_id=None if args.all else args.project_id,
        )
    except KeyError:
        print(f"Project not found: {args.project_id}", file=sys.stderr)
        return 1

    if not changes_by_project:
        print("No image references needed updating.")
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
