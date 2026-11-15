# Diorama Journey

Agent skill that turns an outline into a narrated miniature-3D journey (Remotion + Three.js) plus slides.
Profile: docs-config
Human overview: [README.md](README.md). Direction: [SKILL.md](SKILL.md). Frameworks must not rewrite this file. Maintain this root `AGENTS.md` as the only project handbook; do not create a `CLAUDE.md` alias, copy or import.

## Sources of Truth

This file is the **contract**. Hooks, CI, and config are **enforcement**. If they disagree, that is a failure — raise enforcement to match this file; never lower the contract to a weaker hook.

| Fact | Where |
|---|---|
| Agent handbook | this file |
| Human docs | README.md, SKILL.md, `references/*`, [docs/validation.md](docs/validation.md) |
| Version | SKILL.md metadata `0.1.1`; starter `assets/starter/package.json` `0.1.1` |
| Enforcement | `.github/workflows/ci.yml`, `tests/test_skill.py`, starter tests |
| Machine rules | global `AGENTS.md`, `rules/git-commit.md` |
| Accidents | [Retrospective.md](Retrospective.md) |
| Env files | speech/API keys stay out of the skill tree; productions are outside this repo |

## Project Invariants

- Work in a new `productions/<name>/<timestamp>/` copy. Never overwrite an existing run or edit the installed skill as the production.
- Do not invent measured outcomes in `evidence`. Fictional examples may have empty evidence.
- Motion must be frame-derived. Unseeded randomness, wall-clock animation, or shrinking the Three canvas breaks seeking/export.
- Pass identical `inputProps` into composition selection and render. Covers/slides use `captions:false`.
- Keep large archives outside this source repository.
- The skill has no dependency on a personal workspace or publishing service.

## Stack / Layout

| Component | Choice |
|---|---|
| Language | Markdown skill + Python helpers + TypeScript starter |
| Package manager | npm in `assets/starter` (`package-lock.json`) |
| Runtime | Node ≥ 26.12, Python 3.12 (uv) for media, Remotion 4 |
| Lint | none at repo root |
| Tests | `python3 -m unittest discover -s tests`; starter `npm test` (`node --test`) |
| Data | none in the skill; production files live in the run directory |

```
SKILL.md  scripts/{doctor,create_project}.py
tests/test_skill.py
assets/starter/  references/  docs/
```

## Commands

From the skill root:

```bash
python3 scripts/doctor.py
python3 scripts/create_project.py my-story --output ./productions
python3 -m unittest discover -s tests
```

From `assets/starter` (and from a created production):

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run dev                 # Vite 127.0.0.1:7410
npm run studio              # Remotion :7411
npm run render              # video + slides + clips (heavy; not a handbook gate)
npm run verify
```

Do not run `npm run render` just because it appears here.

## Verification

System1 quality definitions come from `system1-quality` (v1.3.0); CI runs in native mode via `.github/workflows/ci.yml` → `./.github/workflows/quality-slots.yml` with `nocoo/base-ci` composite actions pinned to `v2026.15` (`777bbe4f9bacab8a91d8c01974480a6ee23d28e0`). Branch protection (`main quality gate`) requires `quality / Z1: Gate`.

| Slot | Stage | Command and Scope | Status |
|---|---|---|---|
| S1 Types | CI | `npm run typecheck` in `assets/starter` | enforced |
| S2 Lint | — | no lint script configured at root or in starter | na |
| S3 Workflow | CI | `actionlint` + 40-char SHA pin verification on `.github/workflows/*.yml` | enforced |
| G1 Secrets | CI | `gitleaks` redacted checkout scan | enforced |
| G2 Dependencies | CI | `osv-scanner scan --lockfile=assets/starter/package-lock.json` | enforced |
| B1 Build | CI | `npm run build` in `assets/starter` | enforced |
| L1 Unit | CI, local | `python3 -m unittest discover -s tests`, starter `npm test` and `test_*.py` | enforced |
| L2 Runtime | — | no separate platform runtime binding | na |
| L3 Integration | — | no service API; review site is a local static helper | na |
| L4 E2E | CI | sample WebGL frames + slides rendering & verification in `assets/starter` | enforced |
| P1 Package | — | skill/starter repository; no npm package published | na |
| Z1 Gate | CI | `z1-gate` validator in `quality-slots.yml` aggregating all `impl` slots and matching `github.sha` | enforced |

No husky installed; tests use `TemporaryDirectory` isolation (`tests/test_skill.py` rejects `../escape`). Release publishing (`pages.yml`) remains manual.

## Resources / Isolation

| Purpose | Port / resource | Isolation |
|---|---|---|
| Starter Vite | 7410 `127.0.0.1` | local |
| Remotion studio | 7411 | local |
| Skill tests | tempfile | never write into the installed skill |

## Operations / Release

- Entry: produce in a new run directory; optional GitHub Release of the ZIP
- Auth: repo owner for Pages/releases
- Before ship: CI verify job; [docs/validation.md](docs/validation.md)
- Runbook: [references/production.md](references/production.md) (if present) / SKILL.md

## Retrospective

| Kind | Where |
|---|---|
| Accident narrative | [Retrospective.md](Retrospective.md) |
| Project-specific rule that will recur | one line here (cap ~10) |
| Cross-project lesson | nmem / global `AGENTS.md` / `rules/` |
| Deterministically checkable rule | hook or test, not prose |

- Never render or mutate the installed skill tree; always `create_project.py` first.
