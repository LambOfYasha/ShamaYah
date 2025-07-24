import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(imageURL: string | undefined): string | null {
  if (!imageURL) return null;
  
  // If it's already a full URL, return as is
  if (imageURL.startsWith('http://') || imageURL.startsWith('https://')) {
    return imageURL;
  }
  
  // If it's a Sanity image reference, construct the URL
  if (imageURL.includes('image-')) {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    
    if (projectId && dataset) {
      return `https://cdn.sanity.io/images/${projectId}/${dataset}/${imageURL.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`;
    }
  }
  
  return null;
}

/**
 * Calculate estimated read time for blog content
 * @param content - The blog content (string or PortableText blocks)
 * @returns Object with minutes and formatted string
 */
export function calculateReadTime(content: string | any[] | undefined): { minutes: number; formatted: string } {
  if (!content) {
    return { minutes: 0, formatted: 'Less than 1 min read' };
  }

  let text = '';
  
  // Handle different content types
  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    // Handle PortableText blocks
    text = content.map((block: any) => {
      if (block.children) {
        return block.children.map((child: any) => child.text || '').join('');
      }
      return block.text || '';
    }).join(' ');
  } else {
    return { minutes: 0, formatted: 'Less than 1 min read' };
  }

  // Remove HTML tags and extra whitespace
  text = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 225;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  // Format the read time
  let formatted = '';
  if (minutes < 1) {
    formatted = 'Less than 1 min read';
  } else if (minutes === 1) {
    formatted = '1 min read';
  } else {
    formatted = `${minutes} min read`;
  }
  
  return { minutes, formatted };
}
