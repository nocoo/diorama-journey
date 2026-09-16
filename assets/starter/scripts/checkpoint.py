"""Preserve a production milestone before replacing source, audio, or review media."""
import argparse
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    "src", "scripts", "public", "website", "verification", "research",
    ".gitignore", "README.md", "brief.md", "run.json", "package.json", "package-lock.json", "index.html",
    "LICENSE", "THIRD_PARTY_NOTICES.md", "tests",
    "vite.config.ts", "remotion.config.ts", "tsconfig.json",
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("label", help="Lowercase milestone, e.g. storyboard-v1")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.label):
        parser.error("Use a lowercase label with optional hyphens")
    now = datetime.now().astimezone()
    destination = ROOT / "process/checkpoints" / f"{now:%Y%m%dT%H%M%S%z}-{args.label}"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.mkdir()
    for name in FILES:
        source = ROOT / name
        if source.is_dir():
            shutil.copytree(source, destination / name, ignore=shutil.ignore_patterns(
                "node_modules", ".cache", ".git", "__pycache__", ".DS_Store", "*.tmp.mp3",
            ))
        elif source.is_file():
            shutil.copy2(source, destination / name)
    manifest = []
    for item in sorted(destination.rglob("*")):
        if item.is_file():
            manifest.append({"path": item.relative_to(destination).as_posix(),
                             "bytes": item.stat().st_size,
                             "sha256": hashlib.sha256(item.read_bytes()).hexdigest()})
    (destination / "checkpoint.json").write_text(json.dumps({
        "label": args.label, "createdAt": now.isoformat(), "files": manifest,
    }, indent=2) + "\n")
    print(f"Checkpoint: {destination} ({len(manifest)} files)")


if __name__ == "__main__":
    main()
