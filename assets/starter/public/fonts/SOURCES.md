# Local fonts

DM Sans and Noto Sans SC are available from [Google Fonts](https://fonts.google.com/).
Their SIL Open Font License notices are retained here. The starter includes a
local DM Sans subset. `npm run fonts` downloads fresh subsets for the actual
story text and records the active files in `src/fonts.json`.

The renderer loads those saved files through Remotion's `staticFile()` path;
font downloads are not part of frame rendering.
