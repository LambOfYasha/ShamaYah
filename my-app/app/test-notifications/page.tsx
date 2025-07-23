'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';

export default function TestNotificationsPage() {
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const testNotificationActions = async () => {
    if (!isLoaded || !user) {
      toast({
        title: 'Error',
        description: 'Please sign in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test the notification actions
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Test notifications created successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create test notifications',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testNotificationAPI = async () => {
    if (!isLoaded || !user) {
      toast({
        title: 'Error',
        description: 'Please sign in to test notifications',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test the notification API directly
      const response = await fetch('/api/test-notification-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Test notifications created successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create test notifications',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notification System Test</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>User Loaded: {isLoaded ? 'Yes' : 'No'}</p>
            <p>User Authenticated: {user ? 'Yes' : 'No'}</p>
            <p>User ID: {user?.id || 'Not available'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testNotificationActions}
              disabled={isLoading || !isLoaded || !user}
            >
              {isLoading ? 'Testing...' : 'Test Notification Actions'}
            </Button>
            
            <Button 
              onClick={testNotificationAPI}
              disabled={isLoading || !isLoaded || !user}
              variant="outline"
            >
              {isLoading ? 'Testing...' : 'Test Notification API'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 