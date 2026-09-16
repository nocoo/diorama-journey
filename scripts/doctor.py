"""Check the local tools used by the starter without changing the environment."""
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys


def main():
    missing = []
    for name in ["node", "npm", "python3", "uv", "ffmpeg", "ffprobe"]:
        executable = shutil.which(name)
        if not executable:
            print(f"MISSING  {name}")
            missing.append(name)
            continue
        version = subprocess.run([executable,"-version" if name in {"ffmpeg","ffprobe"} else "--version"],
                                 capture_output=True,text=True,timeout=10)
        line = (version.stdout or version.stderr).splitlines()[0]
        if name == "node":
            parts = re.search(r"(\d+)\.(\d+)\.(\d+)",line)
            if not parts or tuple(map(int,parts.groups())) < (22,12,0):
                missing.append("Node.js 22.12+")
        print(f"FOUND    {name}: {line}")
    if sys.version_info < (3,11):
        missing.append("Python 3.11+")
    candidates = [os.environ.get("CHROME_PATH"), shutil.which("google-chrome"), shutil.which("chromium"),
                  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    browser = next((p for p in candidates if p and Path(p).is_file()), None)
    print("BROWSER  " + (browser or "Let Remotion install Chrome: npx remotion browser ensure (inside a production)"))
    print("Python media scripts use uv-managed Python 3.12. Initial downloads need network access.")
    if missing:
        print("Install: " + ", ".join(missing))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
