'use client';

import { useState, useEffect } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  availableTags: Tag[];
  className?: string;
  label?: string;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function TagSelector({ 
  selectedTags, 
  onTagsChange, 
  availableTags, 
  className,
  label = "Tags"
}: TagSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag._id)
  );

  const selectedTagObjects = availableTags.filter(tag => 
    selectedTags.includes(tag._id)
  );

  const handleTagSelect = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      onTagsChange([...selectedTags, tagId]);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label>{label}</Label>
      
      {/* Selected Tags */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagObjects.map((tag) => (
            <Badge
              key={tag._id}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 cursor-pointer",
                colorClasses[tag.color as keyof typeof colorClasses] || colorClasses.blue
              )}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagRemove(tag._id)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Selector */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredTags.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">
                {searchTerm ? 'No tags found' : 'No tags available'}
              </div>
            ) : (
              filteredTags.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => handleTagSelect(tag._id)}
                  className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      colorClasses[tag.color as keyof typeof colorClasses] || colorClasses.blue
                    )}
                  >
                    {tag.name}
                  </Badge>
                  {tag.description && (
                    <span className="text-sm text-gray-600 truncate">
                      {tag.description}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 