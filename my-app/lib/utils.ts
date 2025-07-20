import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a Sanity CDN URL for an image asset
 * @param assetRef - The Sanity asset reference (e.g., "image-abc123-jpg")
 * @returns The full CDN URL for the image
 */
export function getSanityImageUrl(assetRef: string): string {
  if (!assetRef) return '';
  
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  
  if (!projectId || !dataset) {
    console.error('Missing Sanity environment variables');
    return '';
  }
  
  // Use the same format as the working blog page
  const cleanRef = assetRef
    .replace('image-', '')
    .replace('-jpg', '.jpg')
    .replace('-jpeg', '.jpg')
    .replace('-png', '.png')
    .replace('-webp', '.webp')
    .replace('-gif', '.gif');
  
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${cleanRef}`;
}

/**
 * Validates an image file
 * @param file - The file to validate
 * @returns Object with validation result and error message if any
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image file size must be less than 5MB' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
  }
  
  // Check file name
  if (!file.name || file.name.length > 100) {
    return { isValid: false, error: 'Invalid file name' };
  }
  
  return { isValid: true };
}

/**
 * Converts a file to base64 with error handling
 * @param file - The file to convert
 * @returns Promise that resolves to base64 string or rejects with error
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Sanitizes a filename for safe upload
 * @param filename - The original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
}

/**
 * Handles image loading errors and provides fallback
 * @param imageUrl - The image URL that failed to load
 * @param fallbackUrl - Optional fallback URL
 * @returns A fallback URL or empty string
 */
export function handleImageError(imageUrl: string, fallbackUrl?: string): string {
  console.error("Image failed to load:", imageUrl);
  
  // If we have a fallback, use it
  if (fallbackUrl) {
    return fallbackUrl;
  }
  
  // Return a placeholder image or empty string
  return "";
}

/**
 * Validates if an image URL is accessible
 * @param url - The image URL to validate
 * @returns Promise that resolves to boolean indicating if image is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error("Failed to validate image URL:", error);
    return false;
  }
}

/**
 * Tests image processing functionality
 * @param file - The file to test
 * @returns Promise that resolves to test result
 */
export async function testImageProcessing(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Testing image processing for file:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Test validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Test base64 conversion
    const base64 = await fileToBase64(file);
    if (!base64 || !base64.startsWith('data:image/')) {
      return { success: false, error: "Failed to convert file to base64" };
    }

    console.log("Image processing test successful");
    return { success: true };
  } catch (error) {
    console.error("Image processing test failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
