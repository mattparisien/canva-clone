/**
 * Color Palettes - object structure with name and colors
 * Each palette is an object: { name: "Palette Name", colors: ["#FF0000", "#00FF00", "#0000FF"] }
 */
export interface ColorPalette {
  name: string;
  colors: string[]; // Array of hex color codes
}

export type ColorPalettes = ColorPalette[]; // Array of color palette objects

/**
 * Typography Schema
 */
export interface FontPairing {
  heading: string;
  body: string;
  name: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  fontPairings: FontPairing[];
  isDefault: boolean;
}

/**
 * Logo Schema
 */
export interface Logo {
  name: string;
  url: string;
  cloudinaryId?: string;
  usage: 'primary' | 'secondary' | 'monochrome' | 'variant';
  isDefault: boolean;
}

/**
 * Brand Voice Schema
 */
export interface SampleCopy {
  title: string;
  content: string;
}

export interface BrandVoice {
  tone: string;
  keywords: string[];
  description: string;
  sampleCopy: SampleCopy[];
}

/**
 * Brand Image Schema
 */
export interface BrandImage {
  url: string;
  cloudinaryId?: string;
  category?: string; // e.g., "product", "lifestyle", "team"
  tags?: string[];
}

/**
 * AI Insights Schema
 */
export interface AIInsights {
  generationDate: string;
  assetsAnalyzed: number;
  confidence?: string;
  generationMethod?: string;
  note?: string;
  rawResponse?: any;
  assetAdditions?: {
    assetId: string;
    date: string;
    impact: string;
  }[];
  [key: string]: any; // Allow for flexible structure
}

/**
 * Complete Brand Schema
 */
export interface Brand {
  _id: string;
  name: string;
  userId: string;
  description?: string;
  tagline?: string;
  industry?: string;
  colorPalettes: ColorPalettes;
  typography: Typography[];
  logos: Logo[];
  brandVoice: BrandVoice;
  images: BrandImage[];
  guidelines?: string;
  isActive: boolean;
  shared: boolean;
  sharedWith: string[];
  createdFromAssets: string[];
  aiInsights?: AIInsights;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Brand Request
 */
export type CreateBrandRequest = Partial<Brand>;

/**
 * Generate Brand From Assets Request
 */
export interface GenerateBrandFromAssetsRequest {
  assetIds: string[];
  brandName: string;
}