import {Composition} from 'remotion';
import {Film} from './Film';
import {WIDTH, HEIGHT} from './motion.mjs';
import story from './story.json';
import timing from './generated/timing.json';

export const RemotionRoot = () => <Composition id={story.compositionId} component={Film}
  width={WIDTH} height={HEIGHT} fps={timing.fps} durationInFrames={timing.durationInFrames}
  defaultProps={{captions: true, music: true}}/>;
