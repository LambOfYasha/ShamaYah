import { requireAdmin } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserPlus, 
  Shield, 
  TrendingUp,
  Activity
} from "lucide-react";
import { getAllUsers, getUserStats } from "@/action/userActions";
import UserManagement from "@/components/admin/user-management";

export default async function UsersPage() {
  const user = await requireAdmin();

  // Fetch initial data
  const [usersResult, statsResult] = await Promise.all([
    getAllUsers({ limit: 20 }),
    getUserStats()
  ]);

  const initialUsers = usersResult.success ? usersResult.users : [];
  const initialStats = statsResult.success ? statsResult.stats : null;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">
                Manage users, roles, and permissions across the platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Activity Log
              </Button>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        {initialStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{initialStats.newUsersThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {((initialStats.activeUsers / initialStats.totalUsers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reported Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.reportedUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Admins:</span>
                    <span className="font-medium">{initialStats.roleBreakdown?.admins || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Teachers:</span>
                    <span className="font-medium">{initialStats.roleBreakdown?.teachers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span className="font-medium">{initialStats.roleBreakdown?.members || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management Component */}
        <UserManagement 
          initialUsers={initialUsers}
          initialStats={initialStats}
        />
      </div>
    </div>
  );
} 