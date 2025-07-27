import { adminClient } from '@/sanity/lib/adminClient';
import { defineQuery } from 'groq';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText,
  MapPin,
  Globe,
  Activity
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { ProfileLink } from '@/components/ui/profile-link';
import { formatDistanceToNow } from 'date-fns';

const membersQuery = defineQuery(`
  *[_type == "user" && isDeleted != true && role in ["member", "guest"]] | order(username asc) {
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
    commentCount
  }
`);

export default async function MembersPage() {
  const members = await adminClient.fetch(membersQuery);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Members</h1>
              <p className="text-gray-600">Discover and connect with our community members</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {members.length} Members
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search members..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Active Members
            </Button>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((member: any) => (
            <Card key={member._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-16 h-16">
                    {member.imageURL && getImageUrl(member.imageURL) ? (
                      <AvatarImage 
                        src={getImageUrl(member.imageURL)!} 
                        alt={member.username}
                      />
                    ) : null}
                    <AvatarFallback className="text-lg">
                      {member.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <ProfileLink 
                        userId={member._id}
                        username={member.username}
                        className="font-semibold text-lg hover:underline"
                      >
                        {member.username}
                      </ProfileLink>
                      <Badge variant={member.role === 'member' ? 'default' : 'secondary'} className="text-xs">
                        {member.role}
                      </Badge>
                      {member.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{member.postCount} posts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{member.commentCount} comments</span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-1 text-sm text-gray-600">
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
                            className="text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Bio Preview */}
                    {member.bio && (
                      <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {members.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No members found</h3>
              <p className="text-gray-600">
                There are currently no community members to display.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 