import Link from 'next/link';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface TagProps {
  tag: {
    _id: string;
    name: string;
    slug: string;
    color: string;
  };
  className?: string;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
  green: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
  red: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200',
  orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200',
  pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-200',
  gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

export function Tag({ tag, className, variant = 'default', size = 'md' }: TagProps) {
  const colorClass = colorClasses[tag.color as keyof typeof colorClasses] || colorClasses.blue;
  const sizeClass = sizeClasses[size];

  return (
    <Link href={`/tags/${tag.slug}`}>
      <Badge 
        variant={variant}
        className={cn(
          'cursor-pointer transition-colors duration-200 border',
          colorClass,
          sizeClass,
          className
        )}
      >
        {tag.name}
      </Badge>
    </Link>
  );
}

export function TagList({ tags, className, size = 'md' }: { 
  tags: Array<{_id: string; name: string; slug: string; color: string}>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <Tag key={tag._id} tag={tag} size={size} />
      ))}
    </div>
  );
} 