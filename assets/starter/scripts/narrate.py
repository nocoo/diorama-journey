# /// script
# requires-python = ">=3.11"
# dependencies = ["edge-tts==7.2.8"]
# ///
"""Generate Microsoft speech, measured chapter timing, subtitles and an isolated voice track."""
import asyncio
import math
import re
import subprocess

import edge_tts
from common import ROOT, duration, read_json, require, save_json, speech, srt, story_data, validate_timing, voice_signature


async def main():
    story = story_data()
    audio = ROOT / "public/audio"
    audio.mkdir(parents=True, exist_ok=True)
    scenes, captions, start = [], [], 0
    for i, scene in enumerate(story["scenes"]):
        output = audio / f"{i:02}-{scene['id']}.mp3"
        boundaries = output.with_suffix(".boundaries.json")
        signature = output.with_suffix(".sha256")
        expected = voice_signature(scene, story)
        if not (output.is_file() and boundaries.is_file() and signature.is_file()
                and signature.read_text() == expected):
            for attempt in range(3):
                temporary = output.with_suffix(".tmp.mp3")
                try:
                    chunks = []
                    voice = edge_tts.Communicate(speech(scene, story), story["voice"], rate=story["rate"],
                                                 pitch=story["pitch"], boundary="SentenceBoundary")
                    with temporary.open("wb") as stream:
                        async for chunk in voice.stream():
                            if chunk["type"] == "audio":
                                stream.write(chunk["data"])
                            elif chunk["type"] == "SentenceBoundary":
                                text = chunk["text"]
                                for original, spoken in story.get("pronunciations", {}).items():
                                    text = re.sub(re.escape(spoken), lambda _: original, text, flags=re.IGNORECASE)
                                chunks.append({"text": text, "spokenText": chunk["text"],
                                    "start": chunk["offset"] / 10_000_000, "duration": chunk["duration"] / 10_000_000})
                    require(temporary.stat().st_size > 1000 and chunks, "Speech service returned empty audio or timing")
                    duration(temporary)
                    temporary.replace(output)
                    save_json(boundaries, chunks)
                    signature.write_text(expected)
                    break
                except Exception:
                    temporary.unlink(missing_ok=True)
                    if attempt == 2:
                        raise
                    await asyncio.sleep(attempt + 1)
        seconds = duration(output)
        lead = 30 if i == 0 else 24
        frames = math.ceil((lead / story["fps"] + seconds + 3.0) * story["fps"])
        scenes.append({"id": scene["id"], "index": i, "start": start, "duration": frames, "voiceStart": lead,
                       "audioDuration": seconds, "audio": f"audio/{output.name}",
                       "keyframe": start + min(150, frames - 90)})
        for chunk in read_json(boundaries):
            begin = (start + lead) / story["fps"] + chunk["start"]
            captions.append({"start": begin, "end": begin + chunk["duration"], "text": chunk["text"], "scene": i})
        start += frames
        print(f"{scene['id']}: {seconds:.2f}s voice, {frames/story['fps']:.2f}s chapter", flush=True)
    for current, following in zip(captions, captions[1:]):
        current["end"] = min(current["end"], following["start"])
    timing = {"fps": story["fps"], "durationInFrames": start, "scenes": scenes, "captions": captions}
    validate_timing(story, timing)
    save_json(ROOT / "src/generated/timing.json", timing)
    (audio / "narration.srt").write_text(srt(captions), encoding="utf-8")
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"]
    for scene in scenes:
        command += ["-i", str(ROOT / "public" / scene["audio"])]
    filters = [f"[{i}:a]adelay={round((s['start']+s['voiceStart'])/story['fps']*1000)}:all=1[v{i}]"
               for i, s in enumerate(scenes)]
    filters.append("".join(f"[v{i}]" for i in range(len(scenes)))
                   + f"amix=inputs={len(scenes)}:normalize=0,apad,atrim=duration={start/story['fps']}[voice]")
    subprocess.run(command + ["-filter_complex", ";".join(filters), "-map", "[voice]", "-ar", "48000",
                              "-ac", "1", str(audio / "full-narration.wav")], check=True)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(audio / "full-narration.wav"),
                    "-b:a", "192k", str(audio / "full-narration.mp3")], check=True)
    print(f"Timeline: {start} frames / {start/story['fps']:.2f}s")


if __name__ == "__main__":
    asyncio.run(main())
