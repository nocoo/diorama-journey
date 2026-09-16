import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"scripts"))
from common import validate_timing
from deliver import chapter_captions


class TimelineContracts(unittest.TestCase):
    def setUp(self):
        self.story={"fps":30,"scenes":[{"id":"opening"},{"id":"ending"}]}
        self.timing={"fps":30,"durationInFrames":600,"captions":[{"start":1,"end":2}],"scenes":[
            {"id":"opening","index":0,"start":0,"duration":300,"keyframe":150,"voiceStart":30,"audioDuration":4,"audio":"audio/00-opening.mp3"},
            {"id":"ending","index":1,"start":300,"duration":300,"keyframe":450,"voiceStart":30,"audioDuration":4,"audio":"audio/01-ending.mp3"}]}

    def test_discontinuous_timing_and_overlapping_captions_are_rejected(self):
        validate_timing(self.story,self.timing)
        broken=copy.deepcopy(self.timing)
        broken["scenes"][1]["start"]+=1
        with self.assertRaises(ValueError): validate_timing(self.story,broken)
        self.timing["captions"].append({"start":1.9,"end":3})
        with self.assertRaises(ValueError): validate_timing(self.story,self.timing)

    def test_clip_subtitles_trim_crossing_sentences_and_rebase_time(self):
        captions=[{"text":"crossing","start":8,"end":12},{"text":"inside","start":13,"end":15},{"text":"outside","start":20,"end":21}]
        self.assertEqual(chapter_captions(captions,10,15),[
            {"text":"crossing","start":0,"end":2},{"text":"inside","start":3,"end":5}])


if __name__ == "__main__":
    unittest.main()
