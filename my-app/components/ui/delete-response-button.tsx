'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteResponseAction } from '@/action/deleteResponseAction';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteResponseButtonProps {
  responseId: string;
  responseTitle: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export default function DeleteResponseButton({ 
  responseId, 
  responseTitle, 
  size = 'sm', 
  variant = 'outline' 
}: DeleteResponseButtonProps) {
  console.log("DeleteResponseButton rendered with responseId:", responseId);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    console.log("=== DELETE BUTTON CLICKED ===");
    console.log("Response ID:", responseId);
    console.log("Response Title:", responseTitle);
    
    setIsLoading(true);
    try {
      console.log("Calling deleteResponseAction...");
      const result = await deleteResponseAction(responseId);
      console.log("Delete result:", result);
      
      if ("error" in result) {
        console.error("Delete failed:", result.error);
        alert(`Failed to delete response: ${result.error}`);
        return;
      }
      
      console.log("Delete successful, refreshing page...");
      // Refresh the page to show the updated list
      router.refresh();
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Failed to delete response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size={size} 
          variant={variant} 
          className="text-red-600 hover:text-red-700"
          onClick={() => console.log("Delete button clicked for response:", responseId)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Response</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{responseTitle}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Response'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 