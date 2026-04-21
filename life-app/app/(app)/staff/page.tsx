import { adminClient } from '@/sanity/lib/adminClient';
import { defineQuery } from 'groq';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText,
  MapPin,
  Globe,
  Activity,
  Shield,
  BookOpen,
  Award,
  Star,
  Crown,
  Settings,
  UserCheck
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { ProfileLink } from '@/components/ui/profile-link';
import { formatDistanceToNow } from 'date-fns';

const staffQuery = defineQuery(`
  *[_type == "user" && isDeleted != true && role in ["admin", "moderator", "teacher", "junior_teacher", "senior_teacher", "lead_teacher", "dev"]] | order(role asc, username asc) {
    _id,
    username,
    email,
    imageURL,
    role,
    joinedAt,
    bio,
    location,
    website,
    isActive,
    lastActive,
    postCount,
    commentCount,
    specializations,
    qualifications,
    experience,
    rating,
    totalStudents,
    coursesCreated
  }
`);

const roleConfig = {
  admin: {
    title: 'Administrators',
    description: 'Site administrators with full system access',
    icon: Crown,
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-500'
  },
  dev: {
    title: 'Developers',
    description: 'Technical team and system developers',
    icon: Settings,
    color: 'bg-purple-100 text-purple-800',
    badgeColor: 'bg-purple-500'
  },
  lead_teacher: {
    title: 'Lead Teachers',
    description: 'Senior educators and curriculum leaders',
    icon: Star,
    color: 'bg-yellow-100 text-yellow-800',
    badgeColor: 'bg-yellow-500'
  },
  senior_teacher: {
    title: 'Senior Teachers',
    description: 'Experienced educators and mentors',
    icon: Award,
    color: 'bg-orange-100 text-orange-800',
    badgeColor: 'bg-orange-500'
  },
  teacher: {
    title: 'Teachers',
    description: 'Educators and content creators',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-500'
  },
  junior_teacher: {
    title: 'Junior Teachers',
    description: 'New educators and assistants',
    icon: UserCheck,
    color: 'bg-green-100 text-green-800',
    badgeColor: 'bg-green-500'
  },
  moderator: {
    title: 'Moderators',
    description: 'Community moderators and content reviewers',
    icon: Shield,
    color: 'bg-indigo-100 text-indigo-800',
    badgeColor: 'bg-indigo-500'
  }
};

export default async function StaffPage() {
  const staff = await adminClient.fetch(staffQuery);
  
  // Group staff by role
  const staffByRole = staff.reduce((acc: any, member: any) => {
    const role = member.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(member);
    return acc;
  }, {});

  // Get available roles (those that have staff members)
  const availableRoles = Object.keys(staffByRole).sort((a, b) => {
    const roleOrder = ['admin', 'dev', 'lead_teacher', 'senior_teacher', 'teacher', 'junior_teacher', 'moderator'];
    return roleOrder.indexOf(a) - roleOrder.indexOf(b);
  });

  return (
    <div className="min-h-screen bg-muted py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Staff Directory</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Meet our team of educators, moderators, and administrators</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{staff.length} Staff Members</span>
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground opacity-60 w-4 h-4" />
              <Input 
                placeholder="Search staff..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-sm sm:text-base">Active Staff</span>
            </Button>
          </div>
        </div>

        {/* Staff by Role Tabs */}
        <Tabs defaultValue={availableRoles[0] || 'all'} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-auto h-auto p-1">
            {availableRoles.map((role) => {
              const config = roleConfig[role as keyof typeof roleConfig];
              const Icon = config?.icon || Users;
              return (
                <TabsTrigger key={role} value={role} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{config?.title || role}</span>
                  <span className="sm:hidden">{config?.title?.split(' ')[0] || role}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {staffByRole[role].length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {availableRoles.map((role) => {
            const config = roleConfig[role as keyof typeof roleConfig];
            const Icon = config?.icon || Users;
            
            return (
              <TabsContent key={role} value={role} className="space-y-4 sm:space-y-6">
                {/* Role Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className={`p-2 sm:p-3 rounded-lg ${config?.color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{config?.title}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">{config?.description}</p>
                  </div>
                </div>

                {/* Staff Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {staffByRole[role].map((member: any) => (
                    <Card key={member._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Avatar */}
                          <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                            {member.imageURL && getImageUrl(member.imageURL) ? (
                              <AvatarImage 
                                src={getImageUrl(member.imageURL)!} 
                                alt={member.username}
                              />
                            ) : null}
                            <AvatarFallback className="text-sm sm:text-lg">
                              {member.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <ProfileLink 
                                userId={member._id}
                                username={member.username}
                                className="font-semibold text-base sm:text-lg hover:underline"
                              >
                                {member.username}
                              </ProfileLink>
                              <Badge 
                                className={`text-xs ${config?.badgeColor} text-white`}
                              >
                                {member.role.replace('_', ' ')}
                              </Badge>
                              {member.isActive && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>{member.postCount} posts</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{member.commentCount} comments</span>
                              </div>
                            </div>

                            {/* Teacher-specific stats */}
                            {(member.role === 'teacher' || member.role.includes('teacher')) && (
                              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                                {member.experience && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{member.experience} years exp.</span>
                                  </div>
                                )}
                                {member.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    <span>{member.rating}/5 rating</span>
                                  </div>
                                )}
                                {member.totalStudents && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{member.totalStudents} students</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Additional Info */}
                            <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}</span>
                              </div>
                              {member.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{member.location}</span>
                                </div>
                              )}
                              {member.website && (
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <a 
                                    href={member.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Specializations */}
                            {member.specializations && member.specializations.length > 0 && (
                              <div className="mt-2 sm:mt-3">
                                <div className="flex flex-wrap gap-1">
                                  {member.specializations.slice(0, 3).map((spec: string) => (
                                    <Badge key={spec} variant="outline" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                  {member.specializations.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{member.specializations.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Bio Preview */}
                            {member.bio && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 line-clamp-2">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Empty State */}
        {staff.length === 0 && (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No staff members found</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                There are currently no staff members to display.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 