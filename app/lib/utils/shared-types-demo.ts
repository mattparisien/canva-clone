/**
 * Demonstration of shared types integration
 * This file shows how the new shared types can be used alongside the current implementation
 */

import { 
  CANVAS_SIZE_REGISTRY, 
  getCanvasSizeByHierarchy,
  getCanvasSizesByMainType,
  searchCanvasSizesByTags,
  upgradeCanvasSize,
  type SharedElementType,
  type SharedElement,
  type SharedCanvasSize,
  type SharedPage,
} from '../types/canvas';

// Example function using shared canvas size registry
export function getInstagramPostSize(): SharedCanvasSize | null {
  return getCanvasSizeByHierarchy('social', 'instagram', 'post');
}

// Example function to get all social media sizes
export function getAllSocialMediaSizes(): SharedCanvasSize[] {
  return getCanvasSizesByMainType('social');
}

// Example function to search for square formats
export function getSquareFormats(): SharedCanvasSize[] {
  return searchCanvasSizesByTags(['square']);
}

// Example function to upgrade legacy canvas size to hierarchical format
export function upgradeLegacyCanvasSize(legacySize: {
  name: string;
  width: number;
  height: number;
  category?: string;
}): SharedCanvasSize {
  return upgradeCanvasSize(legacySize, 'custom');
}

// Example function that demonstrates type compatibility
export function demonstrateTypeSafety() {
  // Get Instagram post size using new shared types
  const instagramPost = getInstagramPostSize();
  
  if (instagramPost) {
    console.log('Instagram Post Size:', {
      name: instagramPost.name,
      dimensions: `${instagramPost.width}x${instagramPost.height}`,
      aspectRatio: instagramPost.aspectRatio,
      mainType: instagramPost.mainType,
      platform: instagramPost.platform,
      format: instagramPost.format,
    });
  }

  // Get all social media sizes
  const socialSizes = getAllSocialMediaSizes();
  console.log(`Found ${socialSizes.length} social media canvas sizes`);

  // Search for square formats
  const squareFormats = getSquareFormats();
  console.log(`Found ${squareFormats.length} square formats`);

  // Upgrade a legacy canvas size
  const legacySize = {
    name: "Custom Size",
    width: 800,
    height: 600,
    category: "custom"
  };
  
  const upgradedSize = upgradeLegacyCanvasSize(legacySize);
  console.log('Upgraded canvas size:', upgradedSize);

  return {
    instagramPost,
    socialSizes: socialSizes.length,
    squareFormats: squareFormats.length,
    upgradedSize,
  };
}
