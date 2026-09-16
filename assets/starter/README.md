# A small idea, shared

A runnable, product-neutral Diorama Journey example. One amber lantern travels
through a gate, lookout, workshop, bridge and garden. Replace the story and
physical actions for a new subject; no external project repository is needed.

```sh
npm ci
npm run voice
npm run sound
npm run typecheck
npm run dev
```

Open `http://127.0.0.1:7410`. The bundled speech is cached; the voice command also
builds the isolated full-length narration. New wording needs access to the
speech service. Change `voice`, `language`, `rate` and `pitch` in `src/story.json`
for another narrator or language. Run `npm run fonts` when new text needs glyphs
absent from the local font subsets.

```sh
npm run stills
npm run poster
npm run sample
npm run render
npm run verify
npm run build
npm run review -- http://127.0.0.1:7410/
npm run archive
```

Inspect stills and the transition sample before the full render. `render`
creates the MP4, PPTX/PDF/ODP and chapter clips. `slides` and `clips` can be
rerun independently. The PowerPoint and ODP notes are editable; the visual
pages are full-frame images, not separately editable 3D objects or text.

The complete run keeps `src/`, scripts, fonts, audio, slides, clips, the viewing
website, checkpoints, render records and verification. Use
`npm run checkpoint -- before-revision` before replacing a meaningful draft.
`npm run archive` packages the verified production with checksums; generated
bundles and dependencies can be rebuilt after extraction.

The environment is Node.js 22.12+, Python 3.11+, uv, FFmpeg/ffprobe and Chrome
with WebGL. Media scripts use uv-managed Python 3.12. `CHROME_PATH` can select
Chrome. All Remotion packages must stay at the same pinned version.

See the installed skill's references for the narrative, art and delivery
contracts. Example sources and support code are MIT; fonts and dependencies
retain their own licenses.
