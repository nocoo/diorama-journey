"""Shared story, timing and media contracts for a production."""
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")


def stamp():
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def story_data():
    story = read_json(ROOT / "src/story.json")
    require(SLUG.fullmatch(story["artifact"]), "artifact must be a lowercase filename stem")
    require(re.fullmatch(r"[A-Za-z0-9-]+", story["compositionId"]), "Invalid compositionId")
    require(story["fps"] == 30, "The bundled direction is authored and tested at 30 fps")
    require(len(story["scenes"]) >= 2, "A journey needs at least an opening and an ending")
    seen = set()
    for scene in story["scenes"]:
        require(SLUG.fullmatch(scene["id"]) and scene["id"] not in seen, "Scene IDs must be unique filename stems")
        seen.add(scene["id"])
        for key in ("title", "chapter", "body", "narration", "action"):
            require(isinstance(scene[key], str) and scene[key].strip(), f"Missing {key} in {scene['id']}")
        require(scene["landmark"] in {"gate", "stairs", "workshop", "bridge", "garden"},
                "Add new landmark code and update this check when introducing a new scene type")
    return story


def speech(scene, story):
    text = scene["narration"]
    for original, spoken in story.get("pronunciations", {}).items():
        text = text.replace(original, spoken)
    return text


def voice_signature(scene, story):
    return hashlib.sha256(json.dumps({"text": speech(scene, story), "voice": story["voice"],
        "rate": story["rate"], "pitch": story["pitch"]}, ensure_ascii=False).encode()).hexdigest()


def probe(path):
    return json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_format", "-show_streams",
                                               "-of", "json", str(path)], text=True))


def duration(path):
    return float(probe(path)["format"]["duration"])


def srt_time(seconds):
    ms = round(max(0, seconds) * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def srt(captions):
    return "\n\n".join(f"{i+1}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}"
                        for i, c in enumerate(captions)) + "\n"


def validate_timing(story, timing):
    require(timing["fps"] == story["fps"], "Timing frame rate differs")
    require(len(timing["scenes"]) == len(story["scenes"]), "Timing scene count differs")
    start = 0
    for i, (scene, clock) in enumerate(zip(story["scenes"], timing["scenes"])):
        require(clock["id"] == scene["id"] and clock["index"] == i and clock["start"] == start, "Timing is stale or has gaps")
        require(isinstance(clock["duration"], int) and clock["duration"] > 0, "Invalid chapter duration")
        require(start <= clock["keyframe"] < start + clock["duration"] - 60, "Keyframe is outside the stable chapter")
        require(clock["voiceStart"] + math.ceil(clock["audioDuration"] * timing["fps"]) <= clock["duration"] - 60,
                "Speech overlaps the outgoing transition")
        require(clock["audio"] == f"audio/{i:02}-{scene['id']}.mp3", "Unexpected narration path")
        start += clock["duration"]
    require(start == timing["durationInFrames"], "Total frame count differs")
    previous = 0
    for caption in timing["captions"]:
        require(math.isfinite(caption["start"]) and math.isfinite(caption["end"])
                and previous <= caption["start"] < caption["end"] <= start / timing["fps"], "Overlapping or invalid captions")
        previous = caption["end"]
