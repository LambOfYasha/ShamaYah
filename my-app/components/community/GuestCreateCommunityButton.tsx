'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModeration } from '@/hooks/useModeration';
import { ModerationFeedback } from '@/components/ui/moderation-feedback';
import { richTextContentToPlainText } from '@/lib/utils';

export default function GuestCreateCommunityButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const { toast } = useToast();
  const hasQuestionContent = Boolean(description.trim() || richTextContentToPlainText(content).trim());

  // Initialize moderation for guest community question content
  const {
    content: moderatedContent,
    updateContent: updateModeratedContent,
    moderationState,
    checkModeration,
    clearModeration,
    getModerationFeedback,
    canSubmit
  } = useModeration({
    contentType: 'post',
    debounceMs: 1500,
    autoCheck: true
  });

  // Update moderated content when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    // Check title, description, and content together
    updateModeratedContent(`${value}\n\n${description}\n\n${richTextContentToPlainText(content)}`);
  };

  // Update moderated content when description changes
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    // Check title, description, and content together
    updateModeratedContent(`${title}\n\n${value}\n\n${richTextContentToPlainText(content)}`);
  };

  // Update moderated content when content changes
  const handleContentChange = (value: string) => {
    setContent(value);
    // Check title, description, and content together
    updateModeratedContent(`${title}\n\n${description}\n\n${richTextContentToPlainText(value)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedDescription = description.trim() || richTextContentToPlainText(content).slice(0, 300);
    
    if (!title.trim() || !normalizedDescription.trim() || !guestName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!canSubmit) {
      toast({
        title: "Error",
        description: "Please wait for content moderation to complete",
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

      // Now create the community question using the guest user
      const communityResult = await fetch('/api/communities/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: normalizedDescription,
          content: content.trim(),
          guestUser,
        }),
      });

      if (!communityResult.ok) {
        const error = await communityResult.json();
        throw new Error(error.error || 'Failed to create community question');
      }

      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setContent('');
      setGuestName('');
      setIsOpen(false);
      clearModeration();
      
      toast({
        title: "Success",
        description: "Community question created successfully!",
      });
      
      // Refresh the page to show the new community
      window.location.reload();
    } catch (error) {
      console.error('Error creating guest community:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create community question",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setGuestName('');
    clearModeration();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Ask a Question as Guest
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Ask a Question as Guest
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <Input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Question Title *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter the question title"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Question *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Ask your question here..."
              required
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Question
            </label>
            <ClientRichEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Provide more details about your question..."
              maxHeight="300px"
            />
          </div>
          
          {/* Moderation Feedback */}
          {(title.trim() || description.trim() || content.trim()) && (
            <div className="mt-4">
              <ModerationFeedback
                isChecking={moderationState.isChecking}
                result={moderationState.result}
                error={moderationState.error}
                showDetails={true}
              />
            </div>
          )}
          
          <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t bg-white">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !title.trim() || !hasQuestionContent || !guestName.trim() || !canSubmit}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Community'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 