# Diorama Journey

Agent skill that turns an outline into a narrated miniature-3D journey (Remotion + Three.js) plus slides.
Profile: docs-config
Direction: [SKILL.md](SKILL.md). Frameworks must not rewrite this file.

## Sources of Truth

This file is the **contract**. Hooks, CI, and config are **enforcement**. If they disagree, that is a failure — raise enforcement to match this file; never lower the contract to a weaker hook.

| Fact | Where |
|---|---|
| Agent handbook | this file |
| Human docs | README.md, SKILL.md, `references/*`, [docs/validation.md](docs/validation.md) |
| Version | SKILL.md metadata `0.1.0`; starter `assets/starter/package.json` `0.1.0` |
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
| Runtime | Node ≥ 22.12, Python 3.12 (uv) for media, Remotion 4 |
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

Status: `enforced` | `planned` | `manual` | `N/A`.
6DQ = L1/L2/L3 + G1/G2 + D1. Executable helpers must be tested.

| Change | Proof | Status | Evidence |
|---|---|---|---|
| Logic | L1 ≥ 95% four metrics | planned | CI runs skill unittest + starter `npm test` + Python tests; no coverage thresholds |
| API / schema | L2 real HTTP | N/A | no service API; review site is a local static helper |
| UI path | L3 full film/WebGL | planned | CI renders sample frames + slides, not a full user journey; visual QA is human |
| Types / lint | G1 0 error, 0 warning | planned | starter `npm run typecheck` in CI; no lint script; no ruff |
| Deps / secrets | G2 osv-scanner + gitleaks | planned | CI is a custom job, not quality.yml security. Helpers are executable — G2 still required |
| Test isolation | D1 tempfile productions | enforced | `tests/test_skill.py` uses TemporaryDirectory; rejects `../escape` |
| Bundler output | starter `npm run build` | enforced | CI working-directory `assets/starter` |
| Docs | SKILL/references if workflow changed | manual | human review |
| Release | GitHub release of a production ZIP | manual | `pages.yml` + README download link |

No husky. Target (unmeasured): pre-commit G1+L1 on index snapshot <30s; pre-push applicable G2 on stdin refs <3min. `--no-verify` forbidden.

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
