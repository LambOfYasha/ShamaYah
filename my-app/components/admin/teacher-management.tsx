'use client';

import { GraduationCap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

interface TeacherManagementProps {
  initialTeachers?: TeacherData[];
}

export default function TeacherManagement({ initialTeachers = [] }: TeacherManagementProps) {
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
          { value: 'Theology', label: 'Theology' },
          { value: 'Biblical Studies', label: 'Biblical Studies' },
          { value: 'Church History', label: 'Church History' },
          { value: 'Systematic Theology', label: 'Systematic Theology' },
          { value: 'Pastoral Care', label: 'Pastoral Care' },
          { value: 'Ethics', label: 'Ethics' }
        ]
      }
    ],
    additionalColumns: [
      {
        key: 'specializations',
        label: 'Specializations',
        render: (teacher: TeacherData) => (
          <div className="flex flex-wrap gap-1">
            {teacher.specializations?.map((spec, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
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
    <SharedManagement 
      config={config}
      initialData={initialTeachers}
    />
  );
} 