# Example validation

The original **A small idea, shared** example was rendered on September 17, 2026.
Its production ZIP contains the actual render attempts, source snapshots,
verification records and browser screenshots.

## Local environment

- macOS on Apple Silicon; Google Chrome with WebGL.
- Node.js 26.8.1, npm 11.19.0, Remotion 4.0.520 and Three.js 0.180.0.
- Python 3.14.7 for standard-library helpers; uv-managed Python 3.12.14 for media.
- uv 0.12.11 and FFmpeg / ffprobe 9.0.1.

The documented minimum is Node.js 22.12+ and Python 3.11+. CI uses Node.js 22,
Python 3.12 and Linux software WebGL. Its current results and exported diagnostics
are available in [GitHub Actions](https://github.com/nocoo/diorama-journey/actions/workflows/ci.yml).

## Completed checks

| Check | Result |
| --- | --- |
| Skill format and independent production creation | Valid skill metadata; two helper tests passed |
| Timeline and deterministic seeking | Two JavaScript and two Python contract tests passed |
| TypeScript and Vite | Passed |
| Narration and soundtrack | Five measured chapter recordings; aligned isolated voice and original music |
| Font helper | Downloaded subsets; Chinese and accented Latin probe characters present in the font cmap |
| Full movie | 1920 × 1080, 30 fps, 2,043 frames, 68.10 seconds; complete decode passed |
| Encoded audio | AAC, 48 kHz; measured −16.23 LUFS and −1.49 dBTP |
| Chapter slices | Five MP4s; 412 / 433 / 417 / 393 / 388 frames, with local SRT |
| Presentations | Five pages each in PPTX, PDF and ODP; image hashes and dimensions verified |
| Speaker notes | Full narration read back from every PPTX and ODP page |
| Visual review | Cover, all chapter keyframes, transition samples and encoded-film contact sheet inspected |
| Website | Paused playback, all chapter seeks, presentation download, live 3D switch, preserved playback position and narrow layout passed |
| Subdirectory hosting | Asset and download checks passed under `/diorama-journey/` |

The source and the complete production are published separately. The production
archive uses relative paths and a per-file SHA-256 manifest; dependencies and
rebuildable web bundles are excluded. Use `npm ci` and `npm run build` after
extracting it to rebuild the viewing website.

## Review limits

Visual review used rendered stills and sampled frames. Automated playback and
media checks do not constitute a listening review. No direct listening or native
PowerPoint / LibreOffice presenter-view review was performed in this session.
The slides contain complete composition images and editable speaker notes;
individual 3D objects and headlines are not separately editable shapes.

New stories, voices, glyphs and scene code need their own review. Passing the
example does not validate an arbitrary adapted production.
