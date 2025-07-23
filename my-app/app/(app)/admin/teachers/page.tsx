import { getCurrentUser } from "@/lib/auth/middleware";
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
import { redirect } from "next/navigation";

export default async function TeachersPage() {
  const user = await getCurrentUser();

  // Check if user has permission to manage teachers (Senior Teachers and up)
  if (!user.role || !['senior_teacher', 'lead_teacher', 'dev', 'admin'].includes(user.role)) {
    redirect('/unauthorized');
  }

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Teacher Management</h1>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">
              {user.role === 'admin' ? 'Administrator' : 
               user.role === 'lead_teacher' ? 'Lead Teacher' : 
               user.role === 'dev' ? 'Developer' : 'Senior Teacher'} Access
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        {initialStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialStats.activeTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((initialStats.activeTeachers / initialStats.totalTeachers) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reported Teachers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
                <Award className="h-4 w-4 text-muted-foreground" />
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
        <TeacherManagement initialTeachers={initialTeachers} />
      </div>
    </div>
  );
} 