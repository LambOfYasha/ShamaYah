import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import SimpleTestNotificationButton from "@/components/ui/simple-test-notification-button";

export default function SimpleTestNotificationsPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simple Notification System Test</h1>
          <p className="text-gray-600 mt-2">
            Test the notification system without authentication. This creates notifications for a demo user.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Test Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate test notifications for a demo user. 
                The notifications will be stored in the database.
              </p>
              <div className="flex gap-2">
                <SimpleTestNotificationButton />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How to Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">1. Click the "Test Notifications" button above</p>
                <p className="text-sm text-gray-600">2. Check the browser console for results</p>
                <p className="text-sm text-gray-600">3. Check Sanity Studio for created notifications</p>
                <p className="text-sm text-gray-600">4. Verify notifications are stored in the database</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Notification Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Error notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Warning notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Success notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Info notifications</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">✅ Database storage</p>
                <p className="text-sm">✅ Multiple notification types</p>
                <p className="text-sm">✅ Severity levels</p>
                <p className="text-sm">✅ Additional data support</p>
                <p className="text-sm">✅ Sanity Studio integration</p>
                <p className="text-sm">✅ Error handling</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Database Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Notifications are now stored in Sanity CMS. You can view and manage them in the Sanity Studio.
              </p>
              <Button asChild>
                <a href="/admin/studio" target="_blank" rel="noopener noreferrer">
                  Open Sanity Studio
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 