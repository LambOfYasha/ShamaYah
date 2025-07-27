'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Star, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getAllTeachers, 
  updateTeacherRole, 
  toggleTeacherStatus, 
  deleteTeacher, 
  getTeacherStats,
  bulkUpdateTeachers,
  getTeacherSpecializations,
  type TeacherData,
  type TeacherFilters
} from '@/action/teacherActions';
import SharedManagement, { type ManagementConfig } from './shared-management';
import SpecialtyManager from './specialty-manager';
import SpecializationAssigner from './specialization-assigner';

interface TeacherManagementProps {
  initialTeachers?: TeacherData[];
}

export default function TeacherManagement({ initialTeachers = [] }: TeacherManagementProps) {
  const [activeTab, setActiveTab] = useState('teachers');
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await fetch('/api/admin/specialties');
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data.specialties || []);
      }
    } catch (error) {
      console.error('Error loading specialties:', error);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const config: ManagementConfig = {
    title: 'Teachers',
    icon: GraduationCap,
    dataType: 'teachers',
    roles: [
      { value: 'teacher', label: 'Teacher' },
      { value: 'junior_teacher', label: 'Junior Teacher' },
      { value: 'senior_teacher', label: 'Senior Teacher' },
      { value: 'lead_teacher', label: 'Lead Teacher' }
    ],
    additionalFilters: [
      {
        key: 'specialization',
        label: 'All Specializations',
        options: [
          { value: 'all', label: 'All Specializations' },
          ...specialties.map(spec => ({
            value: spec.name,
            label: spec.name
          }))
        ]
      }
    ],
    additionalColumns: [
      {
        key: 'specializations',
        label: 'Specializations',
        render: (teacher: TeacherData) => (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {teacher.specializations?.map((spec, index) => {
                const specialty = specialties.find(s => s.name === spec);
                return (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: specialty?.color || '#6B7280',
                      color: specialty?.color || '#6B7280'
                    }}
                  >
                    {spec}
                  </Badge>
                );
              })}
            </div>
            <SpecializationAssigner 
              teacher={teacher} 
              specialties={specialties}
              onUpdate={loadSpecialties}
            />
          </div>
        )
      },
      {
        key: 'activity',
        label: 'Activity',
        render: (teacher: TeacherData) => (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              {teacher.rating || 0} rating
            </div>
            <div>{teacher.coursesCreated || 0} courses</div>
          </div>
        )
      }
    ],
    getRoleBadgeVariant: (role: string) => {
      switch (role) {
        case 'lead_teacher':
          return 'destructive';
        case 'senior_teacher':
          return 'default';
        case 'junior_teacher':
          return 'outline';
        case 'teacher':
          return 'secondary';
        default:
          return 'outline';
      }
    },
    getStatusBadgeVariant: (teacher: TeacherData) => {
      if (teacher.isReported) return 'destructive';
      if (!teacher.isActive) return 'secondary';
      return 'default';
    },
    loadData: getAllTeachers,
    updateRole: updateTeacherRole,
    toggleStatus: toggleTeacherStatus,
    deleteItem: deleteTeacher,
    bulkUpdate: bulkUpdateTeachers
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="specialties" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Specialties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers" className="space-y-6">
          {loadingSpecialties ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading specialties...</span>
            </div>
          ) : (
            <SharedManagement config={config} initialData={initialTeachers} />
          )}
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <SpecialtyManager onSpecialtiesChange={loadSpecialties} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 