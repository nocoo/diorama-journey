# Production

## Environment

Use Node.js 22.12+ and npm, Python 3.11+ for helpers, uv, FFmpeg/ffprobe and Chrome
with working WebGL. `uv run --python 3.12` resolves a compatible media-script
environment, installing that Python version if necessary. The renderer uses
`CHROME_PATH`, standard macOS Chrome, or Remotion's browser resolution. In a
Linux environment, `npx remotion browser ensure` can install Chrome Headless
Shell. CI exercises the Linux render path; macOS uses the same composition.

Keep all Remotion packages on the same pinned version, currently 4.0.520. Use
`npm ci` with the checked-in lockfile. If the environment requires a registry
mirror, pass it for that invocation rather than committing a personal registry.
See [third-party notices](../THIRD_PARTY_NOTICES.md) for dependency licenses.

Fonts, narration and music are local during rendering. The example includes
cached speech. Generating new narration uses `edge-tts` and Microsoft's online
speech service without an Azure key. Valid cached speech can be reused when the
service is unavailable. The initial dependency and browser downloads need a
network connection.

For supplied recordings or a different speech service, adapt `scripts/narrate.py`
to retain its output contract: chapter MP3s and measured durations, sentence
boundaries, text/voice cache signatures, `src/generated/timing.json`, SRT, and
the full aligned voice track. This requires an adapter; selecting an arbitrary
provider name in `story.json` does not install a new speech integration.

## Run commands

From a production created by the helper:

```sh
npm ci
npm run fonts
npm run voice
npm run sound
npm run typecheck
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
npm run build
python3 scripts/verify.py --assets-only
npm run stills
npm run poster
npm run sample
```

`fonts` is needed when text gains glyphs absent from the local font subsets.
It downloads OFL font subsets and saves them under `public/fonts/`; retain the
font notices. `voice` produces chapter MP3s, sentence boundaries, signatures,
SRT, measured timing and an isolated full-length voice track. `sound` produces
an original synthesized score matched to that timing. Regenerate sound after
the voice duration changes.

Inspect the stills and the moving transition sample, then finish:

```sh
npm run render
npm run verify
npm run build
npm run dev
```

The default viewer is `http://127.0.0.1:7410`; Remotion Studio uses port 7411.
The viewer starts paused. It offers rendered video, live composition, chapter
seeking and downloads. Building before delivery produces a live-only review;
rebuild afterward to expose the actual finished downloads.

With the website running, `npm run review -- http://127.0.0.1:7410/` checks
paused playback, each chapter seek, downloads, live 3D assets and narrow layout.
It saves screenshots and a report under `verification/`. Use the deployed URL
to check a subdirectory build. `BASE_PATH` controls the Vite base; optional
`VITE_SKILL_URL` and `VITE_RELEASE_URL` add publication links to the viewing site.

`npm run render` executes `video`, `slides` and `clips` sequentially. Retry only
the failed stage. `npm run slides` reuses the existing voice/timing and renders
clean frames without rerendering the MP4. `npm run clips` cuts the current
master into chapters. It refuses a master whose story/timing hash is stale.

```sh
node scripts/render.mjs stills 150,420,800
node scripts/render.mjs sample 330,430
npm run checkpoint -- before-revision
npm run archive
```

Sample ranges are inclusive frame numbers. Chapter manifests instead use
`endFrameExclusive`, so adjacent slices partition the film exactly. Clips
include the chapter's outgoing transition.

## Rendering and checks

The source direction is authored for 16:9, 1920 × 1080 at 30 fps. Frame-based
camera offsets, layout and transition lengths need a deliberate pass when
changing those parameters. The script validates that baseline rather than
pretending arbitrary output ratios are already supported.

Keep the full-size WebGL canvas. Pass the same props to `selectComposition`
and `renderMedia`/`renderStill`; clean slides and covers disable captions.
Use local `staticFile()` URLs when loading fonts and audio for rendering.

`RENDER_CONCURRENCY` defaults to 3. Increase it only when the actual machine's
memory and WebGL stability permit. On a constrained host, try 1. Rendering
speed depends on the browser and graphics backend; there is no fixed estimate.

MP4s use H.264, AAC, 48 kHz audio and faststart. The mastering step targets
-16 LUFS and -1.5 dBTP, preserving the encoded picture. Check pronunciation,
sentence endings and music balance by listening to the result.

`verify` checks narration signatures and real durations, scene continuity,
subtitle bounds, music timing, final frame count, full-video decoding, chapter
frames and PPTX/ODP/PDF contents and notes. Inspect the actual images and native
presenter view where available. Record unavailable checks without treating
structural validation as an office-application or listening review.
