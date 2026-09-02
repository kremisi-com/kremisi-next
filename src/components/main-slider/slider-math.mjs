export function normalizeLoopIndex(index, itemCount) {
  if (!Number.isFinite(index) || itemCount <= 0) return 0;

  return ((index % itemCount) + itemCount) % itemCount;
}
