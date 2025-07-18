import { getCurrentUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  Shield, 
  Settings,
  ArrowRight,
  Home
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Determine which dashboard to show based on role
  const getDashboardLink = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "moderator":
        return "/admin";
      case "teacher":
        return "/admin";
      default:
        return "/dashboard";
    }
  };

  const dashboardLink = getDashboardLink(user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <Home className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.username}!</h1>
          <p className="text-gray-600">Choose your dashboard to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Member Dashboard */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Member Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access your profile, favorites, communities, and settings
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  Go to Member Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          {(user.role === "admin" || user.role === "moderator" || user.role === "teacher") && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <CardTitle>Admin Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage users, content, and system settings
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin">
                    Go to Admin Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-20">
              <Link href="/dashboard/profile">
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <span>View Profile</span>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20">
              <Link href="/dashboard/communities">
                <div className="text-center">
                  <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                  <span>Browse Communities</span>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20">
              <Link href="/dashboard/settings">
                <div className="text-center">
                  <Settings className="w-6 h-6 mx-auto mb-2" />
                  <span>Settings</span>
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* User Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Username:</label>
                <p className="text-gray-600">{user.username}</p>
              </div>
              <div>
                <label className="font-medium">Role:</label>
                <p className="text-gray-600 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="font-medium">Email:</label>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div>
                <label className="font-medium">User ID:</label>
                <p className="text-gray-600">{user._id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
