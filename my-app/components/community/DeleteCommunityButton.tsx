'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface DeleteCommunityButtonProps {
  communityId: string;
  communityTitle: string;
  onDelete: () => Promise<void>;
}

export default function DeleteCommunityButton({ communityId, communityTitle, onDelete }: DeleteCommunityButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('DeleteCommunityButton: Starting delete process');
      const result = await onDelete();
      console.log('DeleteCommunityButton: Delete result:', result);
      
      if (result && 'error' in result) {
        console.error('DeleteCommunityButton: Delete failed:', result.error);
        alert(`Failed to delete community: ${result.error}`);
        return;
      }
      
      console.log('DeleteCommunityButton: Delete successful, redirecting');
      // Redirect to communities page after successful deletion
      router.push('/dashboard/communities');
    } catch (error) {
      console.error('DeleteCommunityButton: Failed to delete community:', error);
      alert(`Failed to delete community: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Community</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{communityTitle}"? This action cannot be undone.
            All posts, comments, and associated data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 