'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CommunitiesClientProps {
  children: React.ReactNode;
}

export default function CommunitiesClient({ children }: CommunitiesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search communities..." 
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