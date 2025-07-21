'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestNotificationButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const generateTestNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Test Notification Created',
          description: 'A test notification has been generated. Check the notification icon in the header.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create test notification',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create test notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateTestNotification}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Bell className="h-4 w-4" />
      {isLoading ? 'Creating...' : 'Test Notification'}
    </Button>
  );
} 