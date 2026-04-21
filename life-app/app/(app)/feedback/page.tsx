'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { createFeedback } from '@/action/feedbackActions';
import { sendFeedbackCreatedNotification } from '@/action/feedbackNotificationActions';
import { useCompactMode } from '@/hooks/use-compact-mode';

interface FeedbackFormData {
  title: string;
  content: string;
  category: string;
  userEmail: string;
  userName: string;
  isAnonymous: boolean;
}

export default function FeedbackPage() {
  const { isSignedIn, user } = useUser();
  const { isCompactMode } = useCompactMode();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState<FeedbackFormData>({
    title: '',
    content: '',
    category: '',
    userEmail: user?.emailAddresses[0]?.emailAddress || '',
    userName: user?.fullName || '',
    isAnonymous: false,
  });

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'ui_ux', label: 'UI/UX Improvement' },
    { value: 'content', label: 'Content Suggestion' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (field: keyof FeedbackFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.isAnonymous && !formData.userEmail.trim()) {
        throw new Error('Email is required when not submitting anonymously');
      }

      const result = await createFeedback({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category as any,
        userEmail: formData.isAnonymous ? undefined : formData.userEmail.trim(),
        userName: formData.isAnonymous ? undefined : formData.userName.trim(),
        isAnonymous: formData.isAnonymous,
      });

      if (result.success && result.feedback) {
        // Send notification
        await sendFeedbackCreatedNotification(
          result.feedback._id,
          result.feedback.title,
          result.feedback.category,
          result.feedback.priority || 'medium',
          result.feedback.userId,
          result.feedback.userName,
          result.feedback.userEmail
        );

        setSubmitStatus('success');
        // Reset form
        setFormData({
          title: '',
          content: '',
          category: '',
          userEmail: user?.emailAddresses[0]?.emailAddress || '',
          userName: user?.fullName || '',
          isAnonymous: false,
        });
      } else {
        throw new Error(result.error || 'Failed to submit feedback');
      }
    } catch (error: any) {
      console.error('Submit feedback error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className={`text-center ${isCompactMode ? 'mb-6 sm:mb-8' : 'mb-8 sm:mb-12'}`}>
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className={`${isCompactMode ? 'h-8 w-8' : 'h-10 w-10'} text-primary mr-3`} />
            <h1 className={`${isCompactMode ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-bold`}>
              Share Your Feedback
            </h1>
          </div>
          <p className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-muted-foreground max-w-2xl mx-auto`}>
            Help us improve Light Is For Everyone by sharing your thoughts, suggestions, and experiences. 
            Your feedback is valuable to us and helps us serve our community better.
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Thank you for your feedback! We've received your submission and will review it carefully. 
              {isSignedIn ? ' You\'ll receive a notification when we respond.' : ' If you provided an email, we\'ll contact you if needed.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle className={`${isCompactMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
              Submit Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className={`${isCompactMode ? 'text-sm' : 'text-base'}`}>
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Brief title for your feedback"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`${isCompactMode ? 'h-9' : 'h-10'}`}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className={`${isCompactMode ? 'text-sm' : 'text-base'}`}>
                  Category *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={`${isCompactMode ? 'h-9' : 'h-10'}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className={`${isCompactMode ? 'text-sm' : 'text-base'}`}>
                  Your Feedback *
                </Label>
                <Textarea
                  id="content"
                  placeholder="Please provide detailed feedback about your experience, suggestions for improvement, or any issues you've encountered..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                  className={`${isCompactMode ? 'text-sm' : 'text-base'}`}
                  required
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => handleInputChange('isAnonymous', checked as boolean)}
                />
                <Label htmlFor="anonymous" className={`${isCompactMode ? 'text-sm' : 'text-base'} cursor-pointer`}>
                  Submit anonymously
                </Label>
              </div>

              {/* User Details (only show if not anonymous) */}
              {!formData.isAnonymous && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className={`${isCompactMode ? 'text-sm' : 'text-base'}`}>
                      Your Name
                    </Label>
                    <Input
                      id="userName"
                      type="text"
                      placeholder="Your name"
                      value={formData.userName}
                      onChange={(e) => handleInputChange('userName', e.target.value)}
                      className={`${isCompactMode ? 'h-9' : 'h-10'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail" className={`${isCompactMode ? 'text-sm' : 'text-base'}`}>
                      Email Address *
                    </Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.userEmail}
                      onChange={(e) => handleInputChange('userEmail', e.target.value)}
                      className={`${isCompactMode ? 'h-9' : 'h-10'}`}
                      required={!formData.isAnonymous}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${isCompactMode ? 'h-9 px-6' : 'h-10 px-8'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
                What We're Looking For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-2 ${isCompactMode ? 'text-sm' : 'text-base'} text-muted-foreground`}>
                <li>• User experience improvements</li>
                <li>• Content and functionality feedback</li>
                <li>• General thoughts and ideas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
                What Happens Next
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-2 ${isCompactMode ? 'text-sm' : 'text-base'} text-muted-foreground`}>
                <li>• We review all feedback carefully</li>
                <li>• We may follow up for more details</li>
                <li>• Updates are shared via notifications</li>
                <li>• Your privacy is always protected</li>
                <li>• Anonymous feedback is also welcome</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
