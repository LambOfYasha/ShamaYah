'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createCommunityResponse } from '@/action/postActions';
import { Plus, X } from 'lucide-react';

interface AddResponseFormProps {
  communityQuestionId: string;
  communityQuestionTitle: string;
  onSuccess?: () => void;
}

export default function AddResponseForm({ 
  communityQuestionId, 
  communityQuestionTitle,
  onSuccess
}: AddResponseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

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

      await createCommunityResponse(communityQuestionId, title, bodyBlocks);
      
      // Reset form and close dialog
      setTitle('');
      setBody('');
      setIsOpen(false);
      
      // Refresh the page to show the new response
      onSuccess?.();
    } catch (error) {
      console.error('Error creating response:', error);
      alert('Failed to create response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setBody('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Response
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Response to "{communityQuestionTitle}"</DialogTitle>
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
              {isLoading ? 'Creating...' : 'Create Response'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 