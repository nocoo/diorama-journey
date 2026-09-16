"""Create a self-contained production from the bundled example."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import shutil

SKILL = Path(__file__).resolve().parents[1]


def create(slug, output):
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError("Use a lowercase project slug with hyphens")
    output = output.expanduser().resolve()
    if output == SKILL or output.is_relative_to(SKILL / "assets"):
        raise ValueError("Create the production outside the installed starter")
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    destination = output / slug / timestamp
    shutil.copytree(SKILL / "assets/starter", destination,
        ignore=shutil.ignore_patterns("node_modules", "website", "process", "verification", "archives",
            "__pycache__", ".DS_Store", "*.tmp.mp3", "review", "slides", "clips", "delivery.json"))
    (destination / "run.json").write_text(json.dumps({
        "schemaVersion":1, "project":slug, "createdAt":datetime.now(timezone.utc).isoformat(),
        "skill":"diorama-journey", "skillVersion":"0.1.0", "status":"draft", "example":True,
        "story":"src/story.json", "motif":"One lantern through connected miniature worlds",
        "review":{"visual":"pending", "listening":"pending", "presenterView":"pending"},
    }, indent=2)+"\n")
    for file in ["LICENSE", "THIRD_PARTY_NOTICES.md"]:
        shutil.copy2(SKILL / file, destination / file)
    return destination


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project")
    parser.add_argument("--output", type=Path, required=True, help="Parent directory for project/timestamp runs")
    args = parser.parse_args()
    try:
        path = create(args.project, args.output)
    except (ValueError, FileExistsError) as error:
        parser.error(str(error))
    print(path)
    print("Next: cd into that run, npm ci, npm run dev. Rewrite the example for your subject.")
