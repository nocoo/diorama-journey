---
name: diorama-journey
description: Create narrated story videos through connected miniature 3D worlds, with one recurring character, object or signal carrying the story across chapters. Use for isometric diorama explainers, process journeys, project stories or narrated retrospectives that need 3D animation, chapter clips and matching presentation slides. Includes a Remotion and Three.js starter, voice generation, PPTX/PDF/ODP exports and production archives.
license: MIT
metadata:
  version: "0.1.0"
---

# Diorama Journey

Tell a story by following something through a small, connected 3D world. The
recurring element carries meaning between chapters; its actions and changing
surroundings explain the subject. Deliver a narrated film and presentations
from the same composition.

Use this for miniature 3D storytelling. Ordinary screen recordings, flat motion
graphics and general slide authoring belong to other workflows. The input can
be an outline, report, lesson, process, repository or user-provided material.
No specific organization, product, account or publishing service is required.

## Shape the story

Identify the audience, takeaway, language, target duration and requested
deliverables from the user's material. Resolve routine choices from context;
ask only for missing decisions that materially change the work. The starter
uses 1920 × 1080, 30 fps and English narration. Change the voice and text for the
requested language. Other canvas sizes require adapting the composition and
checking the actual layout.

Read [story and art direction](references/story-and-art.md). Choose one recurring
character, object or signal and explain what it represents. Give each chapter
one claim, an action and a visible consequence. Preserve that same element
through the transitions, and make the ending resolve the opening.

For factual content, record the source behind claims in each scene's `evidence`
array. Separate the user's confirmed results from proposals. A fictional example
can have empty evidence; never invent measured outcomes to fit the scene.

The included little-light story is a runnable example. Replace its writing and
landmark actions for the new subject. A JSON `action` describes intent; implement
the geometry and motion in `src/art/World.tsx`. Do not assume editing prose has
changed the animation. The provided gate, stairs, workshop, bridge and garden
can be reordered or repeated; add code for a genuinely different action.

## Create an independent production

Use the actual absolute path of this skill in place of `SKILL_DIR`:

```sh
python3 SKILL_DIR/scripts/doctor.py
python3 SKILL_DIR/scripts/create_project.py my-story --output ./productions
```

The helper creates `productions/my-story/UTC_TIMESTAMP/`, copies the runnable
starter and creates `run.json`. Existing runs are never overwritten. Work in the
new run, not in the installed skill. Keep project-specific source material and
publication settings there.

Update `src/story.json`, scene code, HTML metadata and the production brief. Keep
the narration, displayed copy and physical actions consistent. No fixed scene
count is required; every story scene gets timing, a clip and a slide.

## Produce and review

Read [production](references/production.md) for the environment, commands and
rendering invariants. Read [deliverables and preservation](references/deliverables.md)
before rendering the final set.

1. Install the pinned dependencies. Checkpoint before replacing a meaningful
   draft. Generate local font subsets for new glyphs, narration and the music
   bed. Narration determines the timeline and sentence subtitles.
2. Run type checking, the build and asset verification. Render every chapter's
   keyframe, a clean cover and a transition sample. Inspect all stills and the
   moving sample before the full film. Check the motif's continuity, readable
   text, clear actions and the camera path.
3. Render the mastered MP4, clean slides and chapter clips. Export PPTX, PDF,
   ODP and full speaker notes. Run verification; retry only failed stages.
4. Inspect the encoded video, listen to the narration and music, and review the
   exported slides. Check the viewing site's playback, chapter seeking,
   downloads and narrow layout. Report checks that could not run precisely.
5. Build the viewing site after the deliverables exist and archive the finished
   production. Provide paths or links to the output set and its verification
   record. Keep visual or listening feedback as human review when applicable;
   automated checks do not establish those qualities.

The full command is `npm run render`: video, slides, then clips. Use
`npm run slides` to regenerate only presentations and `npm run clips` for slices.
The default delivery includes all of them; honor an explicitly smaller scope.

## Important mechanics

- Derive motion from the requested frame. Keep scene-local motion based on that
  scene's own start, including incoming and outgoing scenes. Unseeded randomness,
  wall-clock animation and advancing render loops break seeking and exports.
- Keep a full-size ThreeCanvas. Move the camera or view offset, not a small
  canvas that clips the world during travel. Inspect WebGL in the actual render.
- Pass identical `inputProps` to composition selection and rendering. Clean
  covers and slides use `captions:false`; otherwise resolved props can put
  subtitles back into those outputs.
- Keep narration MP3, boundaries and cache signatures together. After speech
  changes, regenerate timing and music before images, video, clips and slides.
  Preserve valid cached audio if an online speech request fails.
- Chapter clips use exact frame boundaries and are re-encoded for accurate
  cuts. Their sidecar subtitles are clipped and rebased to chapter time.
- PPTX and ODP contain full-frame images with editable native speaker notes.
  Their 3D objects and headlines are not independent editable slide shapes.
- Preserve original inputs, licenses, source snapshots, render attempts and
  verification records. The archive excludes rebuildable bundles and caches.
  Keep large production archives outside the skill's source repository.
