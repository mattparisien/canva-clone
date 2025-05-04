import { CanvasSize } from "../types/canvas.types"

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

// Default canvas size
export const DEFAULT_CANVAS_SIZE = AVAILABLE_CANVAS_SIZES.find(
  (size) => size.name === "Presentation 16:9"
) || AVAILABLE_CANVAS_SIZES[0]