<h1 align="center">🏞️ Diorama Journey</h1>
<p align="center"><strong>Tell a story through miniature 3D worlds.</strong><br>One recurring element · Connected chapters · Narrated films and matching slides</p>
<p align="center">English · <a href="README.zh-CN.md">简体中文</a></p>
<p align="center">
  <a href="https://github.com/nocoo/diorama-journey/actions/workflows/ci.yml"><img src="https://github.com/nocoo/diorama-journey/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Agent-Skill-748967" alt="Agent Skill" />
  <img src="https://img.shields.io/badge/Remotion-4.0-0B84F3?logo=remotion&logoColor=white" alt="Remotion 4" />
  <img src="https://img.shields.io/badge/Three.js-3D-333333?logo=threedotjs&logoColor=white" alt="Three.js" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/Skill_code-MIT-668B70" alt="MIT skill code" /></a>
</p>

<p align="center"><img src="docs/images/example.jpg" width="960" alt="A little amber lantern travelling through an original miniature island with arches, trees and stone paths" /></p>
<p align="center"><a href="https://nocoo.github.io/diorama-journey/">Watch the live example</a> · <a href="https://github.com/nocoo/diorama-journey/releases/latest">Download the complete production</a></p>

## What it does

Diorama Journey is an open agent skill for turning an outline, report, lesson,
process or project into a narrated journey through connected miniature worlds.
A character, object or signal travels between scenes and carries the story
forward. Architecture and physical actions explain each chapter.

The skill includes a runnable React / Three.js / Remotion starter, a production
workflow and export tools. It works with user-provided material and has no
dependency on a personal workspace, product repository or publishing service.

The original example, **A small idea, shared**, follows an amber lantern through
five islands: a beginning, a lookout, a workshop, a bridge and a garden. It is
68.1 seconds at 1920 × 1080 / 30 fps, with English narration and synthesized music.

## Outputs

| Deliverable | Included |
| --- | --- |
| Film | Mastered H.264 / AAC MP4 and SRT subtitles |
| Chapter slices | One MP4 per chapter, exact frame boundaries and local SRT |
| Narration | Chapter MP3s, sentence timing, cache signatures, isolated full-length WAV / MP3 |
| Music | Original synthesized WAV / MP3, matched to the story timeline |
| Images | Clean cover, chapter keyframes, slide PNGs and storyboard |
| Presentations | **PPTX, PDF and ODP**, with native speaker notes in PPTX / ODP |
| Review website | Video playback, live 3D composition, chapter seeking and downloads |
| Production history | Brief, source snapshots, checkpoints, render attempts, validation and a checksummed ZIP |

Slides preserve the authored composition as a full-frame image. Speaker notes
are editable; individual 3D objects and headline text are not separate slide shapes.

## Install

Using the [skills CLI](https://skills.sh/):

```sh
npx skills add nocoo/diorama-journey
```

Or clone the complete folder into a supported skill location. For Codex:

```sh
git clone https://github.com/nocoo/diorama-journey.git ~/.agents/skills/diorama-journey
```

Other agents that support the [Agent Skills format](https://agentskills.io/)
can use the same `SKILL.md`, `scripts/`, `references/` and `assets/` folder.
The workflow needs an agent with local file and command execution capabilities.

## Use with your agent

```text
Use $diorama-journey to explain this process in a 90-second miniature 3D film.
Follow one parcel through the whole system. Use English narration and export
the film, chapter clips, PowerPoint, PDF, speaker notes and production archive.
```

```text
Use $diorama-journey to turn this retrospective into a narrated visual journey.
Use a seed as the recurring element. Ground the results in the attached material,
and keep the final slides suitable for a presentation.
```

The agent writes the story, implements the scene actions, generates narration,
reviews representative frames and transitions, and exports the full set. The
starter is an example to adapt: changing the script alone does not invent new
3D actions.

## Run the example yourself

| Dependency | Role |
| --- | --- |
| React + Remotion | Composition, frame timeline, playback and video rendering |
| Three.js + React Three Fiber | Geometry, materials, lighting and camera movement |
| Node.js + TypeScript + Vite | Build tools and the review website |
| Chrome / Chromium with WebGL | Browser rendering; Remotion can install its browser |
| FFmpeg / ffprobe | Audio mastering, exact chapter cuts and media validation |
| Python + uv | Isolated media scripts with pinned requirements |
| edge-tts | New narration through Microsoft's online speech service |
| python-pptx, odfpy, ReportLab, Pillow, pypdf | Presentation export and readback checks |
| NumPy | Original synthesized music; no music service is required |

No model API, 3D asset marketplace or hosting account is needed to render the
bundled example. To use supplied narration or another speech provider, adapt the
narration script to the [same output contract](references/production.md).

Install Node.js 22.12+, Python 3.11+, [uv](https://docs.astral.sh/uv/), FFmpeg and
Chrome with WebGL. The media scripts use uv-managed Python 3.12. Check the environment:

```sh
git clone https://github.com/nocoo/diorama-journey.git
cd diorama-journey
python3 scripts/doctor.py
python3 scripts/create_project.py my-story --output ../productions
```

Enter the printed production directory, then:

```sh
npm ci
npm run voice
npm run sound
npm run dev
```

Open **http://127.0.0.1:7410**. The example includes cached narration, so unchanged
speech does not require a new service request. Initial dependencies and browser
downloads still need a network connection. New speech uses Microsoft's online
service through `edge-tts`, without an Azure key.

After adapting and reviewing the story:

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

Run `npm run fonts` when new text needs additional glyphs. Use `npm run slides`
or `npm run clips` to repeat only an export stage. `CHROME_PATH` selects Chrome;
`RENDER_CONCURRENCY=1` reduces render concurrency on smaller machines. See the
[production guide](references/production.md) for the complete sequence.

For a website hosted in a subdirectory, set `BASE_PATH=/your-path/` when building.
Optional `VITE_SKILL_URL` and `VITE_RELEASE_URL` add repository and archive links.

## A public project reference

<p align="center"><img src="docs/images/raven-reference.jpg" width="960" alt="Public Raven project film: a courier carrying a letter through a miniature architectural world" /></p>

The public [Raven](https://github.com/nocoo/raven) project film illustrates the
same storytelling approach with a courier and a letter. This reference is kept
outside the starter. The default story, scenes and exported files are product-neutral.

## Structure

```text
SKILL.md                  Agent workflow and essential constraints
agents/openai.yaml        Optional Codex discovery metadata
scripts/                  Environment check and production creation
references/               Narrative, rendering and delivery contracts
assets/starter/           Runnable 3D story and export tools
docs/images/              Example and public-project reference
```

The [deliverables guide](references/deliverables.md) maps every output and
explains what the archive preserves. Finished productions belong in their own
directories; generated movies and archives are distributed through releases.

## Development

```sh
python3 -m unittest discover -s tests
cd assets/starter
npm ci
npm run typecheck
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
npm run build
```

CI checks the copied starter, timeline contracts, TypeScript, the viewer build,
a Linux WebGL render and the slide/notes round trip. The release example is
also rendered and checked end to end. See [validation](docs/validation.md) for
the tested environment and review limits.

## License

Skill instructions, original example code and support scripts: [MIT](LICENSE).
Dependencies retain their own terms, including the **Remotion License**; fonts
are SIL OFL. See [third-party notices](THIRD_PARTY_NOTICES.md).
