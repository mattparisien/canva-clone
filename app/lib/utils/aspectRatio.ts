/**
 * Utility functions for handling aspect ratios and dimensions
 */

export interface Dimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

/**
 * Calculate the aspect ratio as a decimal number
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get the appropriate Tailwind aspect ratio class based on dimensions
 */
export function getAspectRatioClass(dimensions?: Dimensions): string {
  if (!dimensions) {
    return 'aspect-video'; // Default fallback
  }

  const ratio = calculateAspectRatio(dimensions.width, dimensions.height);
  
  // Common aspect ratios with Tailwind classes
  // 16:9 (1.778)
  if (Math.abs(ratio - 16/9) < 0.05) {
    return 'aspect-video';
  }
  
  // 4:3 (1.333)
  if (Math.abs(ratio - 4/3) < 0.05) {
    return 'aspect-[4/3]';
  }
  
  // 3:2 (1.5)
  if (Math.abs(ratio - 3/2) < 0.05) {
    return 'aspect-[3/2]';
  }
  
  // 1:1 (1.0) - Square
  if (Math.abs(ratio - 1) < 0.05) {
    return 'aspect-square';
  }
  
  // 2:3 (0.667) - Portrait
  if (Math.abs(ratio - 2/3) < 0.05) {
    return 'aspect-[2/3]';
  }
  
  // 3:4 (0.75) - Portrait
  if (Math.abs(ratio - 3/4) < 0.05) {
    return 'aspect-[3/4]';
  }
  
  // 9:16 (0.5625) - Mobile portrait
  if (Math.abs(ratio - 9/16) < 0.05) {
    return 'aspect-[9/16]';
  }
  
  // 21:9 (2.333) - Ultra-wide
  if (Math.abs(ratio - 21/9) < 0.05) {
    return 'aspect-[21/9]';
  }
  
  // For any other ratio, create a custom aspect ratio class
  // Round to 2 decimal places for cleaner classes
  const roundedWidth = Math.round(dimensions.width / 100);
  const roundedHeight = Math.round(dimensions.height / 100);
  
  return `aspect-[${roundedWidth}/${roundedHeight}]`;
}

/**
 * Get aspect ratio class from aspect ratio string (e.g., "16:9", "1:1")
 */
export function getAspectRatioClassFromString(aspectRatio?: string): string {
  if (!aspectRatio) {
    return 'aspect-video';
  }
  
  // Parse aspect ratio string like "16:9"
  const [widthStr, heightStr] = aspectRatio.split(':');
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);
  
  if (isNaN(width) || isNaN(height)) {
    return 'aspect-video';
  }
  
  return getAspectRatioClass({ width, height, aspectRatio });
}

/**
 * Generate inline style for custom aspect ratios that don't have Tailwind classes
 */
export function getAspectRatioStyle(dimensions?: Dimensions): React.CSSProperties | undefined {
  if (!dimensions) {
    return undefined;
  }
  
  const ratio = calculateAspectRatio(dimensions.width, dimensions.height);
  
  // Only return custom style for ratios that don't have standard Tailwind classes
  const commonRatios = [16/9, 4/3, 3/2, 1, 2/3, 3/4, 9/16, 21/9];
  const hasStandardClass = commonRatios.some(commonRatio => Math.abs(ratio - commonRatio) < 0.05);
  
  if (!hasStandardClass) {
    return {
      aspectRatio: ratio.toString()
    };
  }
  
  return undefined;
}
