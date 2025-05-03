/**
 * Editor constants for canvas and elements
 */

// Canvas zoom limits
export const MIN_ZOOM = 25;
export const MAX_ZOOM = 200;

// Resizable element constants
export const SNAP_THRESHOLD = 10; // Threshold for alignment snapping in pixels

// Resize handle dimensions - simple base size that will be divided by scale
export const HANDLE_BASE_SIZE = 18;
// The min/max size constraints are no longer needed as we're using direct scaling
// export const HANDLE_MIN_SIZE = 12;
// export const HANDLE_MAX_SIZE = 24;

// Font sizes
export const DEFAULT_FONT_SIZE = 100;
export const MIN_FONT_SIZE = 1;
export const MAX_FONT_SIZE = 800;

// Font lists
export const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
];

// Text alignment options
export type TextAlignment = "left" | "center" | "right" | "justify";
export const DEFAULT_TEXT_ALIGN: TextAlignment = "center";