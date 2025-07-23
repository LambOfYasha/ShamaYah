'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export default function RichContentRenderer({ content, className }: RichContentRendererProps) {
  // Sanitize the content to prevent XSS attacks
  const sanitizeHTML = (html: string) => {
    // This is a basic sanitization - in production, you might want to use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizedContent = sanitizeHTML(content);

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
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
} 