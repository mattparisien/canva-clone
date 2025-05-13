/**
 * Color Palette
 */
export interface ColorPalette {
  name: string;
  primary: string; // Hex color code
  secondary: string[]; // Array of hex color codes
  accent: string[]; // Array of hex color codes
  isDefault: boolean;
}

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
  industry?: string;
  colorPalettes: ColorPalette[];
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
export interface CreateBrandRequest {
  name: string;
  description?: string;
  industry?: string;
  colorPalettes?: ColorPalette[];
  typography?: Typography[];
  logos?: Logo[];
  brandVoice?: Partial<BrandVoice>;
  images?: BrandImage[];
  guidelines?: string;
}

/**
 * Generate Brand From Assets Request
 */
export interface GenerateBrandFromAssetsRequest {
  assetIds: string[];
  brandName: string;
}