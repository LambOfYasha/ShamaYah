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
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Profile Private</CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                This user has set their profile to private and it cannot be viewed.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="mt-4 w-full sm:w-auto">
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
    <div className="min-h-screen bg-muted py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button variant="outline" size="sm" asChild className="mb-3 sm:mb-4 text-sm">
            <Link href="/">
              ← Back to Home
            </Link>
          </Button>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative mx-auto sm:mx-0">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                    {user.imageURL && getImageUrl(user.imageURL) ? (
                      <AvatarImage 
                        src={getImageUrl(user.imageURL)!} 
                        alt={user.username}
                      />
                    ) : null}
                    <AvatarFallback className="text-xl sm:text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-background rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        {user.role}
                      </Badge>
                      {user.isActive ? (
                        <Badge variant="default" className="text-xs sm:text-sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{user.postCount} posts</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{user.commentCount} comments</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">{user.bio}</p>
                  )}

                  {/* Additional Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    {user.location && (
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                        <a 
                          href={user.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
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
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Activity className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm sm:text-base">Activity information is not available for public profiles.</p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              Privacy Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>This is a public profile view. Some information may be hidden based on user privacy settings.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}