import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("create_project",ROOT/"scripts/create_project.py")
creator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(creator)


class SkillInstallation(unittest.TestCase):
    def test_created_runs_are_independent_and_complete(self):
        with tempfile.TemporaryDirectory() as directory:
            first=creator.create("example",Path(directory))
            second=creator.create("example",Path(directory))
            self.assertNotEqual(first,second)
            for file in ["src/story.json","src/art/World.tsx","src/generated/timing.json","scripts/slides.py",
                         "scripts/deliver.py","package-lock.json","LICENSE","run.json"]:
                self.assertTrue((first/file).is_file(),file)
            manifest=json.loads((first/"run.json").read_text())
            self.assertEqual(manifest["project"],"example")
            self.assertFalse((first/"node_modules").exists())
            self.assertFalse((first/"process").exists())
            (first/"src/story.json").write_text("changed")
            self.assertIn("scenes",json.loads((second/"src/story.json").read_text()))

    def test_path_traversal_is_rejected_before_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError):
                creator.create("../escape",Path(directory))
            self.assertEqual(list(Path(directory).iterdir()),[])


if __name__ == "__main__":
    unittest.main()
