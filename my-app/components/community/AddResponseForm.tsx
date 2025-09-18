'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createCommunityResponse } from '@/action/postActions';
import { useModeration } from '@/hooks/useModeration';
import { ModerationFeedback } from '@/components/ui/moderation-feedback';
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

  // Initialize moderation for response content
  const {
    content: moderatedContent,
    updateContent: updateModeratedContent,
    moderationState,
    checkModeration,
    clearModeration,
    getModerationFeedback,
    canSubmit
  } = useModeration({
    contentType: 'response',
    debounceMs: 1500,
    autoCheck: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    // Check if content is appropriate before submitting
    if (!canSubmit) {
      alert('Please review the content guidelines before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      // Save the HTML content directly as a string
      await createCommunityResponse(communityQuestionId, title, body);
      
      // Reset form and close dialog
      setTitle('');
      setBody('');
      clearModeration();
      setIsOpen(false);
      
      // Call onSuccess callback to refresh the responses list
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
    clearModeration();
    setIsOpen(false);
  };

  // Update moderated content when body changes
  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    updateModeratedContent(newBody);
  };

  const moderationFeedback = getModerationFeedback();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Response
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Response to "{communityQuestionTitle}"</DialogTitle>
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
              onChange={handleBodyChange}
              placeholder="Share your thoughts, insights, or answer to the community question..."
              maxHeight="400px"
            />
            
            {/* Moderation Feedback */}
            {body.trim() && (
              <div className="mt-3">
                <ModerationFeedback
                  isChecking={moderationState.isChecking}
                  result={moderationState.result}
                  error={moderationState.error}
                  showDetails={true}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t bg-white">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Response'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 