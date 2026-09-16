import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneAt, SPACING} from '../src/motion.mjs';

const timing = {fps:30,scenes:[{start:0,duration:360},{start:360,duration:420},{start:780,duration:360}]};
test('the same motif and camera cross every chapter without a positional cut', () => {
  for (const boundary of [360,780]) {
    const before=sceneAt(boundary-0.001,timing), after=sceneAt(boundary,timing);
    assert.ok(Math.abs(before.x-after.x)<0.00001);
    assert.ok(Math.abs(before.journey-after.journey)<0.00001);
    assert.ok(Math.abs(before.stageLeft-after.stageLeft)<0.00001);
  }
});
test('seeking is deterministic and the ending stays on the last island', () => {
  const frame=sceneAt(327,timing);
  sceneAt(1000,timing);
  assert.deepEqual(sceneAt(327,timing),frame);
  const end=sceneAt(1139,timing);
  assert.equal(end.journey,2);
  assert.equal(end.travel,0);
  assert.ok(end.x<3*SPACING);
});
