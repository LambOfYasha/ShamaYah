'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { editCommunityResponse } from '@/action/postActions';
import { useRouter } from 'next/navigation';
import { Edit, Loader2 } from 'lucide-react';

interface EditResponseButtonProps {
  responseId: string;
  currentTitle: string;
  currentBody: any[];
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export default function EditResponseButton({ 
  responseId, 
  currentTitle, 
  currentBody, 
  size = 'sm', 
  variant = 'outline' 
}: EditResponseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [body, setBody] = useState(() => {
    // Convert body blocks to plain text for editing
    if (currentBody && currentBody.length > 0) {
      return currentBody.map((block: any) => 
        block.children?.map((child: any) => child.text).join('') || ''
      ).join('\n');
    }
    return '';
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsLoading(true);
    try {
      // Convert body text to block format for Sanity
      const bodyBlocks = [{
        _type: 'block',
        children: [{
          _type: 'span',
          text: body
        }]
      }];

      await editCommunityResponse(responseId, title, bodyBlocks);
      
      // Reset form and close dialog
      setTitle('');
      setBody('');
      setIsOpen(false);
      
      // Refresh the page to show the updated response
      router.refresh();
    } catch (error) {
      console.error('Error editing response:', error);
      alert('Failed to edit response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    setBody(() => {
      if (currentBody && currentBody.length > 0) {
        return currentBody.map((block: any) => 
          block.children?.map((child: any) => child.text).join('') || ''
        ).join('\n');
      }
      return '';
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Response</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Response Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your response"
              required
            />
          </div>
          
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Response Content
            </label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your detailed response here..."
              rows={8}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Response'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 