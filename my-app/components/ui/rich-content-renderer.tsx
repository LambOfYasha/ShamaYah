'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export default function RichContentRenderer({ content, className }: RichContentRendererProps) {
  // Process and sanitize the content
  const processContent = (html: string) => {
    // Decode common HTML entities
    let processed = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Sanitize the content to prevent XSS attacks
    const sanitized = processed
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Allow safe iframe content (YouTube, Vimeo, etc.)
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, (match) => {
        // Only allow iframes from trusted sources
        if (match.includes('youtube.com/embed/') || 
            match.includes('youtu.be/') ||
            match.includes('vimeo.com/') ||
            match.includes('player.vimeo.com/') ||
            match.includes('dailymotion.com/')) {
          return match;
        }
        return ''; // Remove unsafe iframes
      })
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    return sanitized;
  };

  const processedContent = processContent(content);

  return (
    <div 
      className={cn(
        "prose max-w-none",
        "prose-headings:font-bold prose-headings:text-gray-900",
        "prose-p:text-gray-700 prose-p:leading-relaxed",
        "prose-a:text-blue-600 prose-a:underline prose-a:no-underline hover:prose-a:underline",
        "prose-strong:font-bold prose-strong:text-gray-900",
        "prose-em:italic prose-em:text-gray-700",
        "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
        "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-ul:list-disc prose-ul:pl-6",
        "prose-ol:list-decimal prose-ol:pl-6",
        "prose-li:text-gray-700",
        "prose-table:border-collapse prose-table:w-full",
        "prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-50",
        "prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2",
        "prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg",
        "prose-video:max-w-full prose-video:h-auto prose-video:rounded-lg",
        // Custom styles for video containers
        "[&_.video-container]:relative [&_.video-container]:pb-[56.25%] [&_.video-container]:h-0 [&_.video-container]:overflow-hidden [&_.video-container]:max-w-full [&_.video-container]:my-4",
        "[&_.video-container_iframe]:absolute [&_.video-container_iframe]:top-0 [&_.video-container_iframe]:left-0 [&_.video-container_iframe]:w-full [&_.video-container_iframe]:h-full [&_.video-container_iframe]:border-0",
        "[&_iframe]:max-w-full [&_iframe]:rounded-lg",
        // Custom styles for spoiler functionality
        "[&_details]:my-4 [&_details]:p-4 [&_details]:border [&_details]:border-gray-300 [&_details]:rounded-lg [&_details]:bg-gray-50",
        "[&_summary]:cursor-pointer [&_summary]:font-semibold [&_details]:text-gray-700 [&_summary]:outline-none [&_summary]:hover:text-gray-900",
        "[&_details_summary::-webkit-details-marker]:hidden",
        "[&_details_summary::before]:content-['▶'] [&_details_summary::before]:mr-2 [&_details_summary::before]:text-gray-500 [&_details_summary::before]:transition-transform [&_details_summary::before]:duration-200",
        "[&_details[open]_summary::before]:rotate-90",
        "[&_details_div]:mt-4 [&_details_div]:pt-4 [&_details_div]:border-t [&_details_div]:border-gray-200",
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
} 