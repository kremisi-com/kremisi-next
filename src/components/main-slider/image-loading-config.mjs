export const SLIDER_IMAGE_LOADING_CONFIG = {
  // Main tuning knob for the lightweight image shown during fast movement.
  // Next.js accepts values from 1 to 100: lower means smaller files.
  previewQuality: 28,

  // These are intentionally smaller than the rendered slide. The browser
  // combines this hint with the device pixel ratio when choosing a source.
  previewSizes:
    "(max-width: 480px) 88px, (max-width: 900px) 120px, 180px",

  // The full image is selected responsively once native lazy loading requests it.
  fullImageSizes:
    "(max-width: 480px) 360px, (max-width: 900px) 400px, 450px",

  fullImageFadeDurationMs: 280,
  initialPreviewLoadTimeoutMs: 6000,
};
