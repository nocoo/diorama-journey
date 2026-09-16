# Deliverables and preservation

A complete run has one coherent output set. The story and measured timeline
are the source for its film, audio, chapter slices and slides.

| Output | Location in the production |
| --- | --- |
| Mastered film and subtitles | `public/review/<artifact>.mp4`, `<artifact>.srt` |
| Clean cover, chapter review images, storyboard | `public/review/cover.png`, `NN-<scene>.png`, `storyboard.jpg` |
| Exact chapter videos and local subtitles | `public/clips/NN-<scene>.mp4`, `.srt`, `clips.json` |
| Per-chapter narration | `public/audio/NN-<scene>.mp3`, `.boundaries.json`, `.sha256` |
| Isolated narration, aligned to the full film | `public/audio/full-narration.wav`, `full-narration.mp3` |
| Music master and viewing copy | `public/audio/music.wav`, `music.mp3`, `music.json` |
| Sentence subtitles | `public/audio/narration.srt` |
| PowerPoint, PDF and OpenDocument presentation | `public/slides/<artifact>.pptx`, `.pdf`, `.odp` |
| Clean slide PNGs, notes and page mapping | `public/slides/frames/`, `speaker-notes.md`, `slides.json` |
| Standalone viewing website | `website/`, built by `npm run build` |
| Story, geometry and reusable scripts | `src/`, `scripts/`, configs, lockfile |
| Brief and run status | `brief.md`, `run.json` |
| Draft source/assets snapshots | `process/checkpoints/<timestamp>-<label>/` |
| Render attempts, source snapshot and metadata | `process/renders/<timestamp>-<mode>/` |
| Chapter export attempts | `process/exports/<timestamp>-clips/` |
| Automated checks and human review notes | `verification/` |
| Checked production bundle | `archives/<artifact>-<timestamp>.zip`, `.zip.sha256`, `delivery.json` |

One paused, caption-free keyframe becomes each slide, including the opening
and ending. Every PPTX and ODP slide contains the full narration as native
speaker notes. Slides preserve the composition as a full-frame PNG: notes are
editable, but individual objects and headline text are not separate shapes.
PDF has the same visible pages and bookmarks. No installed Office application
is needed to generate them.

## Iteration

Checkpoint meaningful drafts before replacing them. Each render keeps its own
source snapshot, frame selection, props, hashes, result or failure record, and
raw/mastered outputs. Previous current video and slide exports are preserved
before replacement. Keep unique source assets, narration, music and licenses
with the run. Do not move private source material into an installed public skill.

The archive command first verifies the delivery, then creates a ZIP with
relative paths and SHA-256 for every included file. It keeps meaningful
intermediates and excludes node_modules, caches, `.git`, environment files,
rebuildable render bundles, the duplicate built website and previous archive
ZIPs. Rebuild the website with `npm ci && npm run build` after extraction.
Files outside the run and symbolic links are not followed.

Keep finished archives in an appropriate release or user-selected storage
location. The skill repository contains instructions, template, local fonts,
small example audio and selected previews. Publishing a user's production is a
separate action governed by that user's request.

## Handoff

Provide the film, cover, clips, isolated voice, PPTX/PDF/ODP, speaker notes,
viewing-site launch command and archive. State actual dimensions, frame rate,
duration and completed checks. Update `run.json` with the real review state;
do not claim human acceptance or listening that has not happened.
