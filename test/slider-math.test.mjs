import assert from "node:assert/strict";
import test from "node:test";

import { normalizeLoopIndex } from "../src/components/main-slider/slider-math.mjs";

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
