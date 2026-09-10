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
  getVisibleSliderRange,
  createSliderRangePool,
  isSliderRangeCovered,
} from "../src/components/main-slider/slider-math.mjs";

test("normalizeLoopIndex wraps indexes in both directions", () => {
  assert.equal(normalizeLoopIndex(0, 5), 0);
  assert.equal(normalizeLoopIndex(4, 5), 4);
  assert.equal(normalizeLoopIndex(5, 5), 0);
  assert.equal(normalizeLoopIndex(12, 5), 2);
  assert.equal(normalizeLoopIndex(-1, 5), 4);
  assert.equal(normalizeLoopIndex(-12, 5), 3);
});

test("viewport coverage includes every projected slide on phones, tablets and wide desktops", () => {
  for (const [viewportWidth, viewportHeight] of [[390, 844], [844, 390], [768, 1024], [1264, 625], [1920, 1080], [2560, 1440], [3440, 1440]]) {
    const slope = viewportHeight / viewportWidth;
    const itemWidth = Math.max(Math.round(450 / (slope * 1.3)), 360);
    const itemHeight = Math.max(Math.round(275 / (slope * 1.3)), 220);
    const horizontalShift = (slope - 1.2) * 350;
    for (const scroll of [-7200, -133.7, 0, 119.9, 500000]) {
      const range = getVisibleSliderRange({ scroll, viewportWidth, viewportHeight,
        itemWidth, itemHeight, horizontalShift });
      // Independent corner projection of the CSS rotation matrix.
      const corners = [-1, 1].flatMap(x => [-1, 1].map(y => ({
        x: viewportWidth - itemWidth / 2 + horizontalShift + x * itemWidth / 2 * Math.cos(Math.PI / 6),
        y: itemHeight / 2 + x * itemWidth / 2 * Math.sin(Math.PI / 6) * Math.sin(25 * Math.PI / 180) + y * itemHeight / 2 * Math.cos(25 * Math.PI / 180),
      })));
      for (let index = Math.floor(scroll / 120) - 40; index < scroll / 120 + 40; index++) {
        const x = corners.map(p => p.x + index * 120 - scroll);
        const y = corners.map(p => p.y - index * 120 + scroll);
        if (Math.max(...x) >= 0 && Math.min(...x) <= viewportWidth &&
            Math.max(...y) >= 0 && Math.min(...y) <= viewportHeight) {
          assert.ok(index >= range.start && index <= range.end, `${viewportWidth}x${viewportHeight}: missing ${index}`);
        }
      }
    }
  }
});

test("buffered windows keep identities and coverage through forward, backward and large jumps", () => {
  const geometry = { viewportWidth: 390, viewportHeight: 844, itemWidth: 360,
    itemHeight: 220, horizontalShift: (844 / 390 - 1.2) * 350 };
  const rangeAt = (scroll, overscanItems = 0) => getVisibleSliderRange({ ...geometry, scroll, overscanItems });
  let pool = createSliderRangePool(rangeAt(0, 3));
  let commits = 0;
  for (let scroll = 0; scroll <= 3600; scroll += 2) {
    if (!isSliderRangeCovered(pool, rangeAt(scroll))) {
      const previous = pool;
      pool = createSliderRangePool(rangeAt(scroll, 3));
      for (const item of pool) {
        const retained = previous.find(p => p.logicalIndex === item.logicalIndex);
        if (retained) assert.equal(item.slotId, retained.slotId);
      }
      commits++;
    }
    assert.ok(isSliderRangeCovered(pool, rangeAt(scroll), 0));
  }
  assert.ok(commits <= 15, `too many commits: ${commits}`);
  for (const scroll of [200, -7200, 500000, -500000]) {
    if (!isSliderRangeCovered(pool, rangeAt(scroll))) pool = createSliderRangePool(rangeAt(scroll, 3));
    assert.ok(isSliderRangeCovered(pool, rangeAt(scroll)));
    assert.equal(new Set(pool.map(p => p.slotId)).size, pool.length);
  }
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
