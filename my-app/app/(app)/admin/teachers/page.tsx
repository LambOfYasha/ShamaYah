import { requireAdmin } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  UserPlus, 
  Shield, 
  TrendingUp,
  Activity,
  Award,
  BookOpen,
  Star
} from "lucide-react";
import { getAllTeachers, getTeacherStats } from "@/action/teacherActions";
import TeacherManagement from "@/components/admin/teacher-management";

export default async function TeachersPage() {
  const user = await requireAdmin();

  // Fetch initial data
  const [teachersResult, statsResult] = await Promise.all([
    getAllTeachers({ limit: 20 }),
    getTeacherStats()
  ]);

  const initialTeachers = teachersResult.success ? teachersResult.teachers : [];
  const initialStats = statsResult.success ? statsResult.stats : null;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
              <p className="text-gray-600 mt-2">
                Manage teachers, their specializations, and academic roles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Activity Log
              </Button>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        {initialStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.totalTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  +{initialStats.newTeachersThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.activeTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  {((initialStats.activeTeachers / initialStats.totalTeachers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reported Teachers</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.reportedTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
                <Award className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Lead Teachers:</span>
                    <span className="font-medium">{initialStats.roleBreakdown?.leadTeachers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Senior Teachers:</span>
                    <span className="font-medium">{initialStats.roleBreakdown?.seniorTeachers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular Teachers:</span>
                    <span className="font-medium">{initialStats.roleBreakdown?.regularTeachers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Teacher Management Component */}
        <TeacherManagement 
          initialTeachers={initialTeachers}
          initialStats={initialStats}
        />
      </div>
    </div>
  );
} 