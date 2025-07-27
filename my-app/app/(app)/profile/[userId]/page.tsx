import { notFound } from 'next/navigation';
import { adminClient } from '@/sanity/lib/adminClient';
import { defineQuery } from 'groq';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  MapPin, 
  Globe, 
  Shield, 
  Lock,
  Eye,
  MessageSquare,
  FileText,
  Heart,
  Activity
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

const userQuery = defineQuery(`
  *[_type == "user" && _id == $userId && isDeleted != true][0] {
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
    settings
  }
`);

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { userId } = await params;
  
  console.log('Looking for user with ID:', userId);
  
  const user = await adminClient.fetch(userQuery, { userId });
  
  console.log('Found user:', user);
  
  if (!user) {
    notFound();
  }

  // Check privacy settings
  const profileVisibility = user.settings?.privacy?.profileVisibility || 'public';
  const isProfilePublic = profileVisibility === 'public';
  
  console.log('User settings:', user.settings);
  console.log('Profile visibility:', profileVisibility);
  console.log('Is profile public:', isProfilePublic);
  
  if (!isProfilePublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle className="text-xl">Profile Private</CardTitle>
              <p className="text-gray-600 mt-2">
                This user has set their profile to private and it cannot be viewed.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="mt-4">
                <Link href="/">
                  Return Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/">
              ← Back to Home
            </Link>
          </Button>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    {user.imageURL && getImageUrl(user.imageURL) ? (
                      <AvatarImage 
                        src={getImageUrl(user.imageURL)!} 
                        alt={user.username}
                      />
                    ) : null}
                    <AvatarFallback className="text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.username}</h1>
                    <Badge variant="outline" className="text-sm">
                      {user.role}
                    </Badge>
                    {user.isActive ? (
                      <Badge variant="default" className="text-sm">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-sm">
                        Inactive
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{user.postCount} posts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{user.commentCount} comments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-gray-700 mb-4">{user.bio}</p>
                  )}

                  {/* Additional Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={user.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Activity information is not available for public profiles.</p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>This is a public profile view. Some information may be hidden based on user privacy settings.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 