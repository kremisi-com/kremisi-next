export function normalizeLoopIndex(index, itemCount) {
  if (!Number.isFinite(index) || itemCount <= 0) return 0;

  return ((index % itemCount) + itemCount) % itemCount;
}

export function getVirtualPoolSize({
  viewportHeight,
  itemHeight,
  itemStep,
  overscanItems = 4,
  minimumItems = 15,
  maximumItems = 25,
}) {
  if (itemStep <= 0) return minimumItems;

  const visibleSpan = Math.max(0, viewportHeight) + Math.max(0, itemHeight);
  const requestedItems = Math.ceil(visibleSpan / itemStep) + overscanItems;
  const boundedItems = Math.min(
    maximumItems,
    Math.max(minimumItems, requestedItems),
  );

  // An odd pool keeps the moving anchor centered with equal overscan.
  return boundedItems % 2 === 0
    ? Math.min(maximumItems, boundedItems + 1)
    : boundedItems;
}

export function getVirtualPoolRange(scroll, itemStep, poolSize) {
  const safePoolSize = Math.max(1, Math.floor(poolSize));
  const anchor = itemStep > 0 ? Math.round(scroll / itemStep) : 0;
  const start = anchor - Math.floor(safePoolSize / 2);

  return {
    anchor,
    start,
    end: start + safePoolSize - 1,
  };
}

export function createVirtualPool({
  scroll,
  itemStep,
  poolSize,
}) {
  const { start } = getVirtualPoolRange(scroll, itemStep, poolSize);

  return Array.from({ length: poolSize }, (_, slotId) => ({
    slotId,
    logicalIndex: start + slotId,
  }));
}

export function reconcileVirtualPool({
  pool,
  scroll,
  itemStep,
}) {
  if (pool.length === 0) return pool;

  const { start, end } = getVirtualPoolRange(
    scroll,
    itemStep,
    pool.length,
  );
  const retainedIndexes = new Set(
    pool
      .filter(
        ({ logicalIndex }) => logicalIndex >= start && logicalIndex <= end,
      )
      .map(({ logicalIndex }) => logicalIndex),
  );
  const missingIndexes = [];

  for (let logicalIndex = start; logicalIndex <= end; logicalIndex += 1) {
    if (!retainedIndexes.has(logicalIndex)) missingIndexes.push(logicalIndex);
  }

  if (missingIndexes.length === 0) return pool;

  let missingIndex = 0;
  return pool.map((item) => {
    if (retainedIndexes.has(item.logicalIndex)) return item;

    return {
      slotId: item.slotId,
      logicalIndex: missingIndexes[missingIndex++],
    };
  });
}

export function getProjectIndexForLogicalIndex(
  logicalIndex,
  projectCount,
  sequenceOffset = projectCount - 1,
) {
  return normalizeLoopIndex(logicalIndex + sequenceOffset, projectCount);
}

export function getSlideTransform(logicalIndex, itemStep) {
  const offset = logicalIndex * itemStep;
  return `translate3d(${offset}px, ${-offset}px, 0)`;
}

// Bounds of rotateX(25deg) rotateY(30deg), including both viewport axes.
// The slides are right-aligned; their visible range is not centered on scroll.
export function getVisibleSliderRange({
  scroll, viewportWidth, viewportHeight, itemWidth, itemHeight,
  horizontalShift, itemStep = 120, overscanItems = 0,
}) {
  const projectedWidth = itemWidth * Math.cos(Math.PI / 6);
  const projectedHeight = itemHeight * Math.cos(25 * Math.PI / 180) +
    itemWidth * Math.sin(Math.PI / 6) * Math.sin(25 * Math.PI / 180);
  const left = viewportWidth - itemWidth + horizontalShift +
    (itemWidth - projectedWidth) / 2;
  const top = (itemHeight - projectedHeight) / 2;
  const lower = Math.max(-left - projectedWidth, top - viewportHeight);
  const upper = Math.min(viewportWidth - left, top + projectedHeight);
  return {
    start: Math.floor((scroll + lower) / itemStep) - overscanItems,
    end: Math.ceil((scroll + upper) / itemStep) + overscanItems,
  };
}

export function createSliderRangePool({ start, end }) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => ({
    // Identity follows the content. Moving a window never changes an image
    // underneath a mounted Slide or restarts its decode/fade effects.
    slotId: start + index,
    logicalIndex: start + index,
  }));
}

export function isSliderRangeCovered(pool, range, safetyItems = 1) {
  return pool.length > 0 &&
    pool[0].logicalIndex <= range.start - safetyItems &&
    pool[pool.length - 1].logicalIndex >= range.end + safetyItems;
}
