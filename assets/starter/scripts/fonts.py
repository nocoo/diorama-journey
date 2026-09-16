"""Download local font subsets for the story; rendering uses the saved files."""
import json
import re
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from common import ROOT, save_json

story = json.loads((ROOT / "src/story.json").read_text(encoding="utf-8"))
text = json.dumps(story, ensure_ascii=False)
for path in (ROOT / "src").rglob("*.tsx"):
    text += path.read_text(encoding="utf-8")
latin = "".join(sorted(set("".join(chr(i) for i in range(32,127)) + "✧↗×·—–’") | {char for char in text if 127 < ord(char) <= 255}))
families = [("DM Sans", "Journey", "story-latin", latin)]
cjk = "".join(sorted({char for char in text if ord(char) > 255}))
if cjk:
    families.append(("Noto Sans SC", "JourneyCJK", "story-cjk", cjk))
manifest, stylesheet = [], []
for google, local, prefix, chars in families:
    url = "https://fonts.googleapis.com/css2?" + urlencode({"family":f"{google}:wght@400;600", "text":chars})
    request = Request(url, headers={"User-Agent":"Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36"})
    css = urlopen(request, timeout=30).read().decode()
    urls = list(dict.fromkeys(re.findall(r"url\((https://[^)]+)\)", css)))
    if not urls:
        raise RuntimeError(f"No font returned for {google}")
    for index, font_url in enumerate(urls):
        filename = f"{prefix}-{index}.woff2"
        data = urlopen(font_url,timeout=30).read()
        (ROOT / "public/fonts" / filename).write_bytes(data)
        manifest.append({"family":local, "file":filename, "weight":"100 900"})
        stylesheet.append(f"@font-face{{font-family:{local};src:url('/fonts/{filename}') format('woff2');font-weight:100 900;font-display:swap}}")
    print(f"Saved local {google} subset")
save_json(ROOT / "src/fonts.json",manifest)
(ROOT / "src/fonts.css").write_text("\n".join(stylesheet)+"\n")
