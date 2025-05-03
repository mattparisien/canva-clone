/**
 * Editor constants for canvas and elements
 */

// Canvas zoom limits
export const MIN_ZOOM = 25;
export const MAX_ZOOM = 200;

// Resizable element constants
export const SNAP_THRESHOLD = 10; // Threshold for alignment snapping in pixels

// Resize handle dimensions
export const HANDLE_BASE_SIZE = 18;
export const HANDLE_MIN_SIZE = 12;
export const HANDLE_MAX_SIZE = 24;

// Font sizes
export const DEFAULT_FONT_SIZE = 36;
export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 72;

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