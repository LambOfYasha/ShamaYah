'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProfileLinkProps {
  userId: string;
  username: string;
  className?: string;
  children?: React.ReactNode;
  showBadge?: boolean;
  role?: string;
}

export function ProfileLink({ 
  userId,
  username, 
  className, 
  children, 
  showBadge = false,
  role 
}: ProfileLinkProps) {
  const displayText = children || username;
  
  return (
    <Link 
      href={`/profile/${userId}`}
      className={cn(
        "text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors",
        className
      )}
    >
      {displayText}
      {showBadge && role && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {role}
        </span>
      )}
    </Link>
  );
} 