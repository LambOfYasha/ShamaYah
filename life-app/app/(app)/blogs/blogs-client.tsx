'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BlogsClientProps {
  children: React.ReactNode;
}

export default function BlogsClient({ children }: BlogsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search articles..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
} 