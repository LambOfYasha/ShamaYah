'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { formatViewCount } from '@/lib/utils';

interface ViewCounterProps {
  blogId: string;
  initialViewCount?: number;
  className?: string;
}

export default function ViewCounter({ blogId, initialViewCount = 0, className = '' }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    // Only track view once per session
    if (hasTracked) return;

    const trackView = async () => {
      try {
        const response = await fetch(`/api/blogs/${blogId}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setViewCount(data.viewCount);
          setHasTracked(true);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Small delay to ensure the page has loaded
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [blogId, hasTracked]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Eye className="w-4 h-4" />
      <span>{formatViewCount(viewCount)} views</span>
    </div>
  );
} 