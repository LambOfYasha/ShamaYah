'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useModeration } from '@/hooks/useModeration';
import { ModerationFeedback } from '@/components/ui/moderation-feedback';
import { Plus, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GuestAddResponseFormProps {
  communityQuestionId: string;
  communityQuestionTitle: string;
  onSuccess?: () => void;
}

export default function GuestAddResponseForm({ 
  communityQuestionId, 
  communityQuestionTitle,
  onSuccess
}: GuestAddResponseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [guestName, setGuestName] = useState('');
  const { toast } = useToast();

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
    
    if (!title.trim() || !body.trim() || !guestName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if content is appropriate before submitting
    if (!canSubmit) {
      toast({
        title: "Error",
        description: "Please review the content guidelines before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First create a guest user
      const guestResponse = await fetch('/api/user/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestName: guestName.trim() }),
      });

      if (!guestResponse.ok) {
        const error = await guestResponse.json();
        throw new Error(error.error || 'Failed to create guest user');
      }

      const guestData = await guestResponse.json();
      const guestUser = guestData.user;

      // Now create the community response using the guest user
      const responseResult = await fetch('/api/posts/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityQuestionId,
          title: title.trim(),
          body: body.trim(),
          guestUser,
        }),
      });

      if (!responseResult.ok) {
        const error = await responseResult.json();
        throw new Error(error.error || 'Failed to create response');
      }

      // Reset form and close dialog
      setTitle('');
      setBody('');
      setGuestName('');
      clearModeration();
      setIsOpen(false);
      
      // Call onSuccess callback to refresh the responses list
      onSuccess?.();
      
      toast({
        title: "Success",
        description: "Response created successfully!",
      });
    } catch (error) {
      console.error('Error creating guest response:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setBody('');
    setGuestName('');
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
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Response as Guest
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Add Response as Guest to "{communityQuestionTitle}"
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <Input
              id="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          
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
              disabled={isLoading || !canSubmit || !guestName.trim()}
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