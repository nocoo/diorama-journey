# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy==2.2.6"]
# ///
"""Compose a quiet original celesta bed and transition chimes; no borrowed music."""
import json
import math
import subprocess
import wave
from pathlib import Path

import numpy as np
from common import digest, save_json

ROOT = Path(__file__).resolve().parents[1]
timing = json.loads((ROOT / 'src/generated/timing.json').read_text())
SR = 44100
duration = timing['durationInFrames'] / timing['fps']
audio = np.zeros((math.ceil((duration+1)*SR), 2), dtype=np.float64)


def note(start, midi, length, amplitude, pan=0, soft=False):
    t = np.arange(round(length*SR)) / SR
    frequency = 440 * 2 ** ((midi - 69) / 12)
    if soft:
        tone = np.sin(2*np.pi*frequency*t) + 0.12*np.sin(2*np.pi*frequency*2*t)
        envelope = (1 - np.exp(-t*2)) * np.exp(-t/2.8) * np.minimum(1,(length-t)/0.8)
    else:
        tone = np.sin(2*np.pi*frequency*t) + 0.24*np.sin(2*np.pi*frequency*2.002*t)*np.exp(-t*3) + 0.08*np.sin(2*np.pi*frequency*3*t)*np.exp(-t*7)
        envelope = (1 - np.exp(-t*65)) * np.exp(-t/0.88) * np.minimum(1,(length-t)/0.2)
    signal = tone * envelope * amplitude
    offset = round(start*SR)
    end = min(offset+len(signal),len(audio))
    if end<=offset: return
    signal=signal[:end-offset]
    audio[offset:end,0] += signal*np.sqrt((1-pan)/2)
    audio[offset:end,1] += signal*np.sqrt((1+pan)/2)


# Cmaj9 — Am7 — Fmaj9 — Gsus. Sparse notes leave room for speech.
chords = [(48,55,60,64,71), (45,52,57,60,67), (41,48,53,57,64), (43,50,55,60,62)]
beat = 60/82
for bar,start in enumerate(np.arange(0,duration,beat*8)):
    chord=chords[bar%4]
    for pitch in chord[:3]: note(start,pitch,6.4,0.009,soft=True)
    for j,pitch in enumerate([chord[2]+12,chord[4],chord[3]+12,chord[1]+12]):
        note(start+j*beat*1.5,pitch,2.7,0.036,pan=(-0.32 if j%2 else 0.32))
for scene in timing['scenes'][1:]:
    transition=scene['start']/timing['fps']-1.7
    for j,pitch in enumerate([72,76,79]): note(transition+j*0.16,pitch,2.4,0.04,pan=(j-1)*0.35)
for j,pitch in enumerate([72,76,79,84]): note(duration-4+j*0.27,pitch,3,0.032,pan=0.1*j)
times=np.arange(len(audio))/SR
audio*=np.minimum(1,times/2)[:,None]*np.clip((duration-times)/3.2,0,1)[:,None]
audio=audio[:round(duration*SR)]
wav=ROOT/'public/audio/music.wav'
with wave.open(str(wav),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes((np.clip(audio,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','192k',str(wav.with_suffix('.mp3'))],check=True)
save_json(ROOT/'public/audio/music.json',{'generator':'Original synthesized celesta score',
    'timingSha256':digest(ROOT/'src/generated/timing.json'),'sourceSha256':digest(Path(__file__)),
    'durationSeconds':duration})
print(f'Original celesta score: {duration:.2f}s; peak {np.max(np.abs(audio)):.3f}')
