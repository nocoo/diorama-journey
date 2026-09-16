"""Verify the actual timeline, encoded film, chapter clips and presentation files."""
import argparse
from fractions import Fraction
import subprocess

from common import ROOT, digest, duration, probe, read_json, require, save_json, stamp, story_data, validate_timing, voice_signature


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets-only", action="store_true")
    args = parser.parse_args()
    story = story_data()
    timing = read_json(ROOT / "src/generated/timing.json")
    validate_timing(story, timing)
    for scene, clock in zip(story["scenes"], timing["scenes"]):
        path = ROOT / "public" / clock["audio"]
        require(path.with_suffix(".sha256").read_text() == voice_signature(scene, story), f"Stale narration: {scene['id']}; run npm run voice")
        require(path.with_suffix(".boundaries.json").is_file(), "Missing speech boundaries")
        require(abs(duration(path) - clock["audioDuration"]) < .04, "Narration duration changed")
    for font in read_json(ROOT / "src/fonts.json"):
        require((ROOT / "public/fonts" / font["file"]).is_file(), f"Missing font: {font['file']}")
    require((ROOT / "public/audio/narration.srt").is_file(), "Missing subtitles")
    music = ROOT / "public/audio/music.mp3"
    require(abs(duration(music) - timing["durationInFrames"] / timing["fps"]) < .15, "Music is stale; run npm run sound")
    require(read_json(ROOT / "public/audio/music.json")["timingSha256"] == digest(ROOT / "src/generated/timing.json"), "Music timeline changed")
    report = {"status":"passed", "assetsOnly":args.assets_only, "frames":timing["durationInFrames"],
              "durationSeconds":timing["durationInFrames"]/timing["fps"], "chapters":len(timing["scenes"])}
    if not args.assets_only:
        movie = ROOT / "public/review" / f"{story['artifact']}.mp4"
        record = read_json(ROOT / "public/review/video.json")
        require(record["storySha256"] == digest(ROOT / "src/story.json")
                and record["timingSha256"] == digest(ROOT / "src/generated/timing.json"), "Video is stale")
        require(record["sha256"] == digest(movie), "Video bytes changed")
        info = probe(movie)
        video = next(s for s in info["streams"] if s["codec_type"] == "video")
        audio = next(s for s in info["streams"] if s["codec_type"] == "audio")
        require((video["width"],video["height"]) == (1920,1080) and video["codec_name"] == "h264", "Unexpected video format")
        require(int(video["nb_frames"]) == timing["durationInFrames"] and Fraction(video["avg_frame_rate"]) == timing["fps"], "Frame count or rate differs")
        require(audio["codec_name"] == "aac" and int(audio["sample_rate"]) == 48000, "Unexpected audio format")
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-xerror","-i",str(movie),"-f","null","-"],check=True)
        for name in ["full-narration.mp3","full-narration.wav"]:
            require(abs(duration(ROOT / "public/audio" / name)-report["durationSeconds"]) < .15, "Isolated narration differs from the timeline")
        clips = read_json(ROOT / "public/clips/clips.json")
        require(clips["sourceSha256"] == digest(movie) and len(clips["chapters"]) == len(timing["scenes"]), "Clips are stale")
        for item, scene in zip(clips["chapters"], timing["scenes"]):
            path = ROOT / "public/clips" / item["file"]
            require(item["id"] == scene["id"] and item["startFrame"] == scene["start"]
                    and item["endFrameExclusive"] == scene["start"]+scene["duration"], "Clip boundaries differ")
            require(digest(path) == item["sha256"], "Clip bytes changed")
            stream = next(s for s in probe(path)["streams"] if s["codec_type"] == "video")
            require(int(stream["nb_frames"]) == scene["duration"], f"Wrong frame count in {item['file']}")
        subprocess.run(["uv","run","--python","3.12",str(ROOT / "scripts/slides.py"),"verify"],check=True)
        report["videoSha256"] = digest(movie)
        report["presentations"] = ["pptx","pdf","odp"]
        report["humanReview"] = "Automated checks cannot establish visual quality, pronunciation or native office-app rendering."
    save_json(ROOT / "verification" / f"{stamp()}-{'assets' if args.assets_only else 'delivery'}.json", report)
    print(f"Passed: {report['chapters']} chapters, {report['frames']} frames, {report['durationSeconds']:.2f}s"
          + (" (assets)" if args.assets_only else " (video, audio, clips and slides)"))


if __name__ == "__main__":
    main()
