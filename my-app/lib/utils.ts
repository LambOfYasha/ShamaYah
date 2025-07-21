import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { urlFor } from "@/sanity/lib/image"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get proper image URL
export const getImageUrl = (imageRef: string) => {
  if (!imageRef) return null;
  
  // If it's already a full URL (http/https), return it
  if (imageRef.startsWith('http')) {
    return imageRef;
  }
  
  // If it's a base64 data URL, return it directly
  if (imageRef.startsWith('data:')) {
    return imageRef;
  }
  
  // If it's a Sanity asset reference, build the URL using the existing utility
  if (imageRef.startsWith('image-')) {
    try {
      return urlFor({ _ref: imageRef }).url();
    } catch (error) {
      console.error('Error building Sanity image URL:', error);
      return null;
    }
  }
  
  // If it's just a regular string that might be a Sanity asset ID
  try {
    return urlFor({ _ref: imageRef }).url();
  } catch (error) {
    console.error('Error building Sanity image URL:', error);
    return null;
  }
};
