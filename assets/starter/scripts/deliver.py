"""Export exact chapter clips or package a complete, checksummed production."""
import argparse
import shutil
import subprocess
from zipfile import ZIP_DEFLATED, ZipFile

from common import ROOT, digest, read_json, require, save_json, srt, stamp, story_data, validate_timing


def chapter_captions(captions, start, end):
    return [{"text":c["text"], "start":max(c["start"],start)-start, "end":min(c["end"],end)-start}
            for c in captions if c["end"] > start and c["start"] < end]


def clips():
    story = story_data()
    timing = read_json(ROOT / "src/generated/timing.json")
    validate_timing(story, timing)
    movie = ROOT / "public/review" / f"{story['artifact']}.mp4"
    video = read_json(ROOT / "public/review/video.json")
    require(video["storySha256"] == digest(ROOT / "src/story.json") and video["timingSha256"] == digest(ROOT / "src/generated/timing.json")
            and video["sha256"] == digest(movie), "Render the current film before exporting chapter clips")
    attempt = ROOT / "process/exports" / f"{stamp()}-clips"
    output = attempt / "clips"
    output.mkdir(parents=True)
    manifest = {"sourceSha256":digest(movie), "fps":timing["fps"], "chapters":[]}
    for i, scene in enumerate(timing["scenes"]):
        start = scene["start"] / timing["fps"]
        seconds = scene["duration"] / timing["fps"]
        path = output / f"{i+1:02}-{scene['id']}.mp4"
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-ss",f"{start:.9f}","-i",str(movie),
                        "-map","0:v:0","-map","0:a:0","-frames:v",str(scene["duration"]),"-t",f"{seconds:.9f}",
                        "-c:v","libx264","-preset","fast","-crf","18","-pix_fmt","yuv420p","-c:a","aac",
                        "-b:a","192k","-ar","48000","-movflags","+faststart",str(path)],check=True)
        path.with_suffix(".srt").write_text(srt(chapter_captions(timing["captions"],start,start+seconds)),encoding="utf-8")
        manifest["chapters"].append({"id":scene["id"],"file":path.name,"startFrame":scene["start"],
            "endFrameExclusive":scene["start"]+scene["duration"],"durationSeconds":seconds,"sha256":digest(path)})
        print(f"Exported {path.name} ({scene['duration']} frames)",flush=True)
    save_json(output / "clips.json",manifest)
    current = ROOT / "public/clips"
    if current.exists():
        current.rename(attempt / "previous-clips")
    shutil.copytree(output,current)


def archive():
    subprocess.run(["python3",str(ROOT / "scripts/verify.py")],check=True)
    story = story_data()
    archive_dir = ROOT / "archives"
    archive_dir.mkdir(exist_ok=True)
    target = archive_dir / f"{story['artifact']}-{stamp()}.zip"
    excluded = {"node_modules",".git",".venv","__pycache__","archives","website","render-web",".cache"}
    files = []
    for path in sorted(ROOT.rglob("*")):
        relative = path.relative_to(ROOT)
        if not path.is_file() or path.is_symlink() or any(part in excluded for part in relative.parts):
            continue
        if path.name in {".DS_Store","delivery.json"} or path.name.startswith(".env") or path.name.endswith(".tmp.mp3"):
            continue
        files.append(path)
    manifest = {"schemaVersion":1,"title":story["title"],"artifact":story["artifact"],
        "source":{"storySha256":digest(ROOT/"src/story.json"),"timingSha256":digest(ROOT/"src/generated/timing.json")},
        "excludedRebuildableDirectories":sorted(excluded),
        "files":[{"path":p.relative_to(ROOT).as_posix(),"bytes":p.stat().st_size,"sha256":digest(p)} for p in files]}
    save_json(ROOT / "delivery.json",manifest)
    with ZipFile(target,"x",compression=ZIP_DEFLATED,compresslevel=6) as bundle:
        for path in files:
            bundle.write(path,path.relative_to(ROOT).as_posix())
        bundle.write(ROOT / "delivery.json","delivery.json")
    target.with_suffix(".zip.sha256").write_text(f"{digest(target)}  {target.name}\n")
    print(f"Archive: {target}\n{len(files)} source, media and process files")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command",choices=["clips","archive"])
    args = parser.parse_args()
    clips() if args.command == "clips" else archive()
