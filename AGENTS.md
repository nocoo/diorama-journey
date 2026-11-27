# Diorama Journey

Agent skill that turns an outline into a narrated miniature-3D journey (Remotion 4 + Three.js) plus presentation slides.
Docs: [README.md](README.md) · [SKILL.md](SKILL.md) · [Production](references/production.md) · [Deliverables](references/deliverables.md) · [Story & Art](references/story-and-art.md) · [Validation](docs/validation.md) · [Retrospective](Retrospective.md)

Layout: `SKILL.md`, `scripts/{doctor,create_project}.py`, `tests/test_skill.py`, `assets/starter/` (TypeScript/Remotion starter with `package-lock.json`), `references/`, `docs/`.

## Commands

Requires Node >= 26.12, Python 3.11+ (`uv` with Python 3.12 for media), FFmpeg/ffprobe, and WebGL Chrome.

From repo root:

```sh
python3 scripts/doctor.py                                        # check local tools
python3 scripts/create_project.py my-story --output ./productions
python3 -m unittest discover -s tests                            # L1 skill tests
```

From `assets/starter` (or a created production):

```sh
npm ci
npm run typecheck                                                # S1
npm run lint                                                     # S2 (Biome)
npm test                                                         # L1 JS (node --test)
python3 -m unittest discover -s tests -p 'test_*.py'             # L1 Python contracts
npm run build                                                    # B1 Vite viewer build
npm run dev                                                      # Vite viewer 127.0.0.1:7410
npm run studio                                                   # Remotion Studio :7411
npm run verify                                                   # verify media, frames & slides
npm run render                                                   # video + slides + clips (heavy; do not run as a routine gate)
```

## Invariants

- Never render or mutate the installed skill tree; run `create_project.py` into a new `productions/<name>/<timestamp>/` copy and never overwrite an existing run.
- Keep `SKILL.md` metadata, `assets/starter/package.json`, and `scripts/create_project.py` (`skillVersion`) version numbers in sync (`0.1.1`).
- Do not invent measured outcomes in scene `evidence`; fictional examples may leave `evidence` empty.
- Derive all motion from frame numbers; unseeded randomness, wall-clock animation, or shrinking `ThreeCanvas` breaks deterministic seeking and export.
- Pass identical `inputProps` into composition selection and rendering; clean covers and slides must set `captions: false`.
- Keep speech/API keys, private source material, and large production archives outside this repository; the skill has no dependency on a personal workspace or publishing service.
- Keep `assets/starter/package-lock.json` registry-portable with canonical public registry URLs; verify overrides with `npm ls` and OSV, not manifest edits alone.
- Publishing GitHub Release ZIPs is `manual` and requires repo-owner authorization after CI and [Validation](docs/validation.md). The example site deploys via [pipeline.yml](.github/workflows/pipeline.yml) (`D1`–`D5` Pages via `deploy-pages.yml` on `main` push or `workflow_dispatch(deploy=true)`, reusing the `B1` `b1-website` artifact without GitHub Release `.zip` assets).

## Quality & Local Gates

Follows `system1-quality`; CI/CD runs [.github/workflows/pipeline.yml](.github/workflows/pipeline.yml) -> [quality-slots.yml](.github/workflows/quality-slots.yml) (`quality / Z1: Gate` required on `main`, pinned `base-ci` `v2026.24`), gating `deploy` (`D1`–`D5` GitHub Pages via `deploy-pages.yml`, verifying `https://nocoo.github.io/diorama-journey/` in `D5`). Status vocabulary: `enforced`, `planned`, `manual`, `N/A`.

- **CI enforced**: `S1`, `S2`, `S3`, `G1`, `G2`, `B1`, `L1` (root + starter), `L4` (WebGL sample + slides verify), and `Z1`.
- **Exceptions (`N/A`)**: `L2 Runtime` (no platform binding), `L3 Integration` (local static review site, no API), `P1 Package` (skill/starter repo, no npm publish).
- **Local hooks**: none installed; run root and starter checks manually before committing. Skill tests use `TemporaryDirectory` isolation and verify `../escape` rejection.

## Resources & Isolation

| Surface | Endpoint / Resource | Boundary |
| --- | --- | --- |
| Starter Vite | `127.0.0.1:7410` | Local review viewer (`--strictPort`) |
| Remotion Studio | `127.0.0.1:7411` | Local composition preview |
| Skill tests | `TemporaryDirectory` | Isolated temp dir; never write into the installed skill |
| Productions / Releases | External `productions/` & GitHub Releases | Keep archives out of git; GitHub Pages deploys via `pipeline.yml` (`D1`–`D5` on `main`) |

## Retrospective

Record incident narratives in [Retrospective.md](Retrospective.md); promote recurring project constraints to `Invariants` above and enforceable safeguards to tests or hooks.
