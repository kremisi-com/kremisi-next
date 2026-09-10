// Set this to "start" to restore the lightweight preview followed by the
// optimized full-resolution image. Any other value shows source images directly.
export const ENABLE_COMPRESSION = "start";

export const SLIDER_IMAGE_LOADING_CONFIG = {
  previewQuality: 28,
  previewSizes:
    "(max-width: 480px) 88px, (max-width: 900px) 120px, 180px",
  fullImageFadeDurationMs: 280,
  initialPreviewLoadTimeoutMs: 6000,
};
