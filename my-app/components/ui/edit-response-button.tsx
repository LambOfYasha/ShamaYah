'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import { editCommunityResponse } from '@/action/postActions';
import { Edit, Loader2 } from 'lucide-react';

interface EditResponseButtonProps {
  responseId: string;
  currentTitle: string;
  currentBody: string | any[];
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  onSuccess?: () => void;
}

export default function EditResponseButton({ 
  responseId, 
  currentTitle, 
  currentBody, 
  size = 'sm', 
  variant = 'outline',
  className = '',
  onSuccess
}: EditResponseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  
  // Convert old block format to HTML string for compatibility
  const convertBodyToHtml = (body: string | any[]): string => {
    if (typeof body === 'string') {
      return body;
    }
    // Handle old Sanity block format
    if (Array.isArray(body) && body.length > 0) {
      return body.map((block: any) => 
        block.children?.map((child: any) => child.text).join('') || ''
      ).join('\n');
    }
    return '';
  };
  
  const [body, setBody] = useState(convertBodyToHtml(currentBody));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsLoading(true);
    try {
      // Save the HTML content directly
      await editCommunityResponse(responseId, title, body);
      
      // Reset form and close dialog
      setTitle('');
      setBody('');
      setIsOpen(false);
      
      // Refresh the page to show the updated response
      onSuccess?.();
    } catch (error) {
      console.error('Error editing response:', error);
      alert('Failed to edit response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    setBody(convertBodyToHtml(currentBody));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Response</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
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
            <ClientRichEditor
              content={body}
              onChange={(newBody) => setBody(newBody)}
              placeholder="Write your detailed response here..."
              maxHeight="400px"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t bg-white flex-shrink-0">
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