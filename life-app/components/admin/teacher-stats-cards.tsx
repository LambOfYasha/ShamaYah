'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, TrendingUp, Award, RefreshCw } from 'lucide-react';
import { getTeacherStats } from '@/action/teacherActions';

interface TeacherStats {
  totalTeachers: number;
  activeTeachers: number;
  reportedTeachers: number;
  newTeachersThisMonth: number;
  roleBreakdown: {
    leadTeachers: number;
    seniorTeachers: number;
    juniorTeachers: number;
    regularTeachers: number;
  };
}

export default function TeacherStatsCards() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTeacherStats();
      if (result.success && result.stats) {
        setStats(result.stats as TeacherStats);
      } else {
        setError(result.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchStats]);

  const safePercent = (part: number, total: number) =>
    total > 0 ? Math.round((part / total) * 100) : 0;

  if (error) {
    return (
      <div className="mb-6 p-4 border rounded-lg text-center text-sm text-muted-foreground">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchStats}>
          <RefreshCw className="w-3 h-3 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  const SkeletonBlock = () => (
    <div className="space-y-1">
      <div className="h-7 w-16 bg-muted animate-pulse rounded" />
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
    </div>
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="text-xs text-muted-foreground"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <SkeletonBlock /> : stats ? (
              <>
                <div className="text-2xl font-bold">{stats.totalTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newTeachersThisMonth} this month
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <SkeletonBlock /> : stats ? (
              <>
                <div className="text-2xl font-bold">{stats.activeTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  {safePercent(stats.activeTeachers, stats.totalTeachers)}% of total
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Teachers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <SkeletonBlock /> : stats ? (
              <>
                <div className="text-2xl font-bold">{stats.reportedTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
              </div>
            ) : stats ? (
              <>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Lead Teachers
                    </span>
                    <span className="font-medium">{stats.roleBreakdown.leadTeachers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Senior Teachers
                    </span>
                    <span className="font-medium">{stats.roleBreakdown.seniorTeachers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Regular Teachers
                    </span>
                    <span className="font-medium">{stats.roleBreakdown.regularTeachers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      Junior Teachers
                    </span>
                    <span className="font-medium">{stats.roleBreakdown.juniorTeachers}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Total: {stats.totalTeachers} teachers
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
