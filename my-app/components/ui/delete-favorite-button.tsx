'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteIndividualFavoriteAction } from '@/action/embeddedCommentActions';
import { useRouter } from 'next/navigation';

interface DeleteFavoriteButtonProps {
  favoriteId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export default function DeleteFavoriteButton({ 
  favoriteId, 
  className = '',
  size = 'sm',
  variant = 'outline'
}: DeleteFavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (isLoading) return;

    if (!confirm('Are you sure you want to remove this favorite?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteIndividualFavoriteAction(favoriteId);
      // Refresh the page to show updated favorites
      router.refresh();
    } catch (error) {
      console.error('Error deleting favorite:', error);
      alert('Failed to delete favorite. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDelete}
      disabled={isLoading}
      className={className}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
} 