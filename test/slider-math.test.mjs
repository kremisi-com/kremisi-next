import assert from "node:assert/strict";
import test from "node:test";

import {
  createVirtualPool,
  getProjectIndexForLogicalIndex,
  getSlideTransform,
  getVirtualPoolRange,
  getVirtualPoolSize,
  normalizeLoopIndex,
  reconcileVirtualPool,
} from "../src/components/main-slider/slider-math.mjs";

test("normalizeLoopIndex wraps indexes in both directions", () => {
  assert.equal(normalizeLoopIndex(0, 5), 0);
  assert.equal(normalizeLoopIndex(4, 5), 4);
  assert.equal(normalizeLoopIndex(5, 5), 0);
  assert.equal(normalizeLoopIndex(12, 5), 2);
  assert.equal(normalizeLoopIndex(-1, 5), 4);
  assert.equal(normalizeLoopIndex(-12, 5), 3);
});

test("normalizeLoopIndex safely handles invalid loop sizes", () => {
  assert.equal(normalizeLoopIndex(3, 0), 0);
});

test("getVirtualPoolSize stays small and adapts to tall viewports", () => {
  assert.equal(
    getVirtualPoolSize({ viewportHeight: 720, itemHeight: 376, itemStep: 120 }),
    15,
  );
  assert.equal(
    getVirtualPoolSize({ viewportHeight: 1440, itemHeight: 275, itemStep: 120 }),
    19,
  );
  assert.equal(
    getVirtualPoolSize({ viewportHeight: 4000, itemHeight: 275, itemStep: 120 }),
    25,
  );
});

test("getVirtualPoolRange follows positive and negative scroll", () => {
  assert.deepEqual(getVirtualPoolRange(0, 120, 15), {
    anchor: 0,
    start: -7,
    end: 7,
  });
  assert.deepEqual(getVirtualPoolRange(-7210, 120, 15), {
    anchor: -60,
    start: -67,
    end: -53,
  });
  assert.deepEqual(getVirtualPoolRange(241, 120, 15), {
    anchor: 2,
    start: -5,
    end: 9,
  });
});

test("reconcileVirtualPool only changes slots that leave the window", () => {
  const initialPool = createVirtualPool({
    scroll: 0,
    itemStep: 120,
    poolSize: 15,
  });
  const nextPool = reconcileVirtualPool({
    pool: initialPool,
    scroll: 120,
    itemStep: 120,
  });
  const changedSlots = nextPool.filter(
    (item, index) => item !== initialPool[index],
  );

  assert.equal(changedSlots.length, 1);
  assert.equal(changedSlots[0].logicalIndex, 8);
  assert.deepEqual(
    nextPool.map(({ logicalIndex }) => logicalIndex).sort((a, b) => a - b),
    Array.from({ length: 15 }, (_, index) => index - 6),
  );
});

test("reconcileVirtualPool handles large jumps without duplicating indexes", () => {
  const initialPool = createVirtualPool({
    scroll: -7200,
    itemStep: 120,
    poolSize: 15,
  });
  const jumpedPool = reconcileVirtualPool({
    pool: initialPool,
    scroll: 7200,
    itemStep: 120,
  });
  const logicalIndexes = jumpedPool
    .map(({ logicalIndex }) => logicalIndex)
    .sort((a, b) => a - b);

  assert.deepEqual(
    logicalIndexes,
    Array.from({ length: 15 }, (_, index) => index + 53),
  );
  assert.equal(new Set(logicalIndexes).size, 15);
});

test("logical indexes preserve the deterministic project order forever", () => {
  assert.equal(getProjectIndexForLogicalIndex(0, 58), 57);
  assert.equal(getProjectIndexForLogicalIndex(1, 58), 0);
  assert.equal(getProjectIndexForLogicalIndex(59, 58), 0);
  assert.equal(getProjectIndexForLogicalIndex(-58, 58), 57);
  assert.equal(getProjectIndexForLogicalIndex(-59, 58), 56);
});

test("slide transforms place logical items along the original diagonal", () => {
  assert.equal(getSlideTransform(0, 120), "translate3d(0px, 0px, 0)");
  assert.equal(
    getSlideTransform(-3, 120),
    "translate3d(-360px, 360px, 0)",
  );
});
