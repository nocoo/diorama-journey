export const WIDTH = 1920;
export const HEIGHT = 1080;
export const SPACING = 16;
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (value) => {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const side = (index) => index % 2 === 0 ? 1 : -1;

/** @param {number} frame @param {{fps:number, scenes:Array<{start:number,duration:number}>}} timing */
export function sceneAt(frame, timing) {
  const index = Math.max(0, timing.scenes.findLastIndex((scene) => frame >= scene.start));
  const scene = timing.scenes[index];
  const local = frame - scene.start;
  const transition = Math.min(timing.fps * 2, scene.duration / 3);
  const hasNext = index < timing.scenes.length - 1;
  const travel = hasNext ? smooth((local - scene.duration + transition) / transition) : 0;
  const journey = index + travel;
  const x = travel > 0
    ? mix(index * SPACING + 1.2, (index + 1) * SPACING - 1.6, travel)
    : index * SPACING + mix(-1.6, 1.2, smooth(local / (timing.fps * 4)));
  return {
    index, local, travel, journey, x,
    textOpacity: smooth(local / 24) * (hasNext ? 1 - smooth((local - scene.duration + transition) / 24) : 1),
    stageLeft: mix(side(index) > 0 ? 790 : -100, side(index + 1) > 0 ? 790 : -100, travel),
  };
}
