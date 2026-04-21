'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SimpleTestNotificationButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const generateTestNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-notification-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('Test notifications created:', result.notifications);
        toast({
          title: 'Test Notifications Created',
          description: `${result.notifications?.length || 3} test notifications have been generated and stored in the database.`,
        });
      } else {
        console.error('Failed to create test notifications:', result.error);
        toast({
          title: 'Error',
          description: result.error || 'Failed to create test notifications',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating test notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test notifications',
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
      {isLoading ? 'Creating...' : 'Test Notifications'}
    </Button>
  );
} 