import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  ArrowLeft,
  Edit,
  Save,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Calendar,
  Activity
} from "lucide-react";
import { SettingsForm } from "@/components/settings-form";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account and preferences</p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Settings Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <SettingsForm user={user} />
        </Tabs>
      </div>
    </div>
  );
} 