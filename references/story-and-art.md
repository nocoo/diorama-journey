# Story and art direction

The recurring element is the subject's visible thread. It might be a seed
growing into a garden, a parcel moving through a system, a traveller learning a
route, or a signal connecting teams. Give it a stable silhouette and purpose.
Each chapter should change what it can do, where it can go, or what it carries.

Use one compact scene to explain one point. An obstacle, action and consequence
usually communicate more than labels on decorative architecture. Examples:

| Narrative | Visible action |
| --- | --- |
| Something is hard to reach | A bridge physically extends across a gap |
| Evidence changes a decision | A lookout reveals two paths; the traveller chooses |
| Separate parts begin to cooperate | Pieces settle into a working structure |
| Knowledge becomes reusable | The carried light illuminates a path for the next traveller |

Keep claims grounded in the supplied material. Numbers and before/after results
need evidence. Define specialist words in the narration before making the
viewer read them. A short film may omit detail; the omitted detail belongs in
the brief or presenter notes, not in a misleading simplification.

## Visual vocabulary

Prefer original isometric or orthographic miniature architecture: stairs,
arches, terraces, courtyards, bridges and small islands. Clear silhouettes,
soft daylight, restrained pastel colors and tactile matte materials make the
space legible. Depth and animated physical actions carry the explanation.

The starter's cream, sage and terracotta palette is one example. Change lighting,
materials, typography and architecture together when the story needs another
direction. Keep a consistent scale. Leave enough quiet screen space for one
headline and one supporting sentence.

Use the general vocabulary of architectural puzzle worlds as inspiration.
Create original geometry, routes, characters and composition; game-specific
artwork is not a dependency. No asset-generation API is needed for the bundled
world, which is built from code.

## Continuity

Connect neighboring locations with visible traversable space. Move the same
element along that connection while the camera follows. Ease travel at both
ends. Keep scene-local animations stable when seeking backwards or rendering
frames in parallel. The first and last frame of each transition should agree
on the element's world position and camera offset.

The five built-in landmarks are illustrative actions. `story.json` may reorder,
repeat, add or remove scenes as long as there are at least two. Select a supported
`landmark`; implement new kinds in `src/art/World.tsx` and extend the validation
set in `scripts/common.py`. Do not silently map an unknown kind to unrelated
architecture.

## Production brief

Keep the audience, single takeaway, input sources, language, approximate duration,
recurring element and chapter/action outline in the run's `brief.md`. The user
can provide any part of it. The agent completes routine choices and writes the
story. Preserve important revisions through checkpoints before replacing a
meaningful draft.
