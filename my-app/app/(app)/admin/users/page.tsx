import { requireAdminOrLeadTeacher } from "@/lib/auth/middleware";
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
  const user = await requireAdminOrLeadTeacher();

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              {user.role === 'admin' ? 'Administrator' : 'Lead Teacher'} Access
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        {initialStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((initialStats.activeUsers / initialStats.totalUsers) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.teachers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((initialStats.teachers / initialStats.totalUsers) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{initialStats.newUsersThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  New users this month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management Component */}
        <UserManagement initialUsers={initialUsers} />
      </div>
    </div>
  );
} 