import { CanvasSize } from "../types/canvas"

// Default font size as a percentage of canvas width
export const DEFAULT_TEXT_FONT_SIZE_RATIO = 0.09 // 9% of canvas width

// Define available canvas sizes with categories
export const AVAILABLE_CANVAS_SIZES: CanvasSize[] = [
  // Social Media - Instagram
  { name: "Instagram Post", width: 1080, height: 1080, category: "Instagram" },
  { name: "Instagram Story", width: 1080, height: 1920, category: "Instagram" },
  { name: "Instagram Reels", width: 1080, height: 1920, category: "Instagram" },
  { name: "Instagram Profile", width: 320, height: 320, category: "Instagram" },

  // Social Media - Facebook
  { name: "Facebook Post", width: 1200, height: 630, category: "Facebook" },
  { name: "Facebook Cover", width: 851, height: 315, category: "Facebook" },
  { name: "Facebook Story", width: 1080, height: 1920, category: "Facebook" },
  { name: "Facebook Ad", width: 1200, height: 628, category: "Facebook" },

  // Social Media - Twitter/X
  { name: "Twitter Post", width: 1200, height: 675, category: "Twitter" },
  { name: "Twitter Header", width: 1500, height: 500, category: "Twitter" },
  { name: "Twitter Profile", width: 400, height: 400, category: "Twitter" },

  // Social Media - LinkedIn
  { name: "LinkedIn Post", width: 1200, height: 627, category: "LinkedIn" },
  { name: "LinkedIn Cover", width: 1584, height: 396, category: "LinkedIn" },
  { name: "LinkedIn Profile", width: 400, height: 400, category: "LinkedIn" },

  // Social Media - YouTube
  { name: "YouTube Thumbnail", width: 1280, height: 720, category: "YouTube" },
  { name: "YouTube Channel Art", width: 2560, height: 1440, category: "YouTube" },

  // Social Media - TikTok
  { name: "TikTok Video", width: 1080, height: 1920, category: "TikTok" },
  { name: "TikTok Profile", width: 200, height: 200, category: "TikTok" },

  // Print
  { name: "A4", width: 794, height: 1123, category: "Print" },
  { name: "A5", width: 559, height: 794, category: "Print" },
  { name: "US Letter", width: 816, height: 1056, category: "Print" },
  { name: "US Legal", width: 816, height: 1344, category: "Print" },

  // Presentation
  { name: "Presentation 16:9", width: 1280, height: 720, category: "Presentation" },
  { name: "Presentation 4:3", width: 1024, height: 768, category: "Presentation" },

  // Custom
  { name: "Square", width: 1000, height: 1000, category: "Custom" },
  { name: "Landscape", width: 1280, height: 720, category: "Custom" },
  { name: "Portrait", width: 720, height: 1280, category: "Custom" },
]

// Canvas constants
export const DEFAULT_CANVAS_SIZE = {
  name: "Presentation (16:9)",
  width: 1280,
  height: 720
};

// Default element settings
export const DEFAULT_TEXT_ELEMENT = {
  type: "text" as const,
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  content: "Text element",
  fontSize: 20,
  fontFamily: "Inter",
  textAlign: "left" as const,
  isNew: true,
  isBold: false,
  isItalic: false,
  isUnderlined: false,
  isStrikethrough: false
};

// Default canvas sizes
export const CANVAS_SIZES = [
  DEFAULT_CANVAS_SIZE,
  {
    name: "Instagram Post (1:1)",
    width: 1080,
    height: 1080,
    category: "Social Media"
  },
  {
    name: "Instagram Story (9:16)",
    width: 1080,
    height: 1920,
    category: "Social Media"
  },
  {
    name: "Facebook Post (1.91:1)",
    width: 1200,
    height: 628,
    category: "Social Media"
  },
  {
    name: "Twitter Post (16:9)",
    width: 1200,
    height: 675,
    category: "Social Media"
  },
  {
    name: "LinkedIn Post (1:1)",
    width: 1104,
    height: 1104,
    category: "Social Media"
  },
  {
    name: "YouTube Thumbnail (16:9)",
    width: 1280,
    height: 720,
    category: "Video"
  },
  {
    name: "A4 Document",
    width: 794,
    height: 1123,
    category: "Print"
  },
  {
    name: "US Letter",
    width: 816,
    height: 1056,
    category: "Print"
  }
];

// Zoom levels
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const DEFAULT_ZOOM = 1;
export const ZOOM_STEP = 0.1;

// Text formatting
export const TEXT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];
export const FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
  "Source Sans Pro",
];

// Selection constants
export const SELECTION_HANDLE_SIZE = 8;