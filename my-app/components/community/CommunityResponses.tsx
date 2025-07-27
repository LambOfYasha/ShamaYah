'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { 
  MessageSquare, 
  User, 
  Calendar, 
  Eye, 
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { getCommunityResponses } from '@/action/postActions';
import AddResponseForm from './AddResponseForm';
import EditResponseButton from '@/components/ui/edit-response-button';
import DeleteResponseButton from '@/components/ui/delete-response-button';
import ApproveResponseButton from '@/components/ui/approve-response-button';
import FavoriteButton from '@/components/ui/favorite-button';
import { ReportButton } from '@/components/ui/report-button';
import { canEditContent, canDeleteContent } from '@/lib/auth/roles';
import RichContentRenderer from '@/components/ui/rich-content-renderer';
import { getImageUrl } from '@/lib/utils';
import { ProfileLink } from '@/components/ui/profile-link';

interface CommunityResponsesProps {
  communityQuestionId: string;
  user?: any;
  communityQuestionTitle?: string;
}

interface Response {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
  body: string | any[];
  image?: any;
  isApproved: boolean;
  approvedBy?: {
    _id: string;
    username: string;
  };
  approvedAt?: string;
  publishedAt: string;
  author: {
    _id: string;
    username: string;
    imageURL?: string;
    role?: string;
  };
}

export default function CommunityResponses({ communityQuestionId, user, communityQuestionTitle }: CommunityResponsesProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();

  const fetchData = async () => {
    try {
      setLoading(true);
      const responsesResult = await getCommunityResponses(communityQuestionId);

      if ('success' in responsesResult) {
        setResponses(responsesResult.responses);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [communityQuestionId]);

  // Function to refresh responses after any action
  const refreshResponses = () => {
    fetchData();
  };

  const canApprove = user && (user.role === 'senior_teacher' || user.role === 'lead_teacher' || user.role === 'admin');
  const canEdit = (response: Response) => {
    if (!user) return false;
    
    // Guests cannot edit
    if (user.role === 'guest') return false;
    
    const isOwnContent = user._id === response.author._id;
    return canEditContent(user.role, isOwnContent);
  };
  
  const canDelete = (response: Response) => {
    if (!user) return false;
    
    // Guests cannot delete
    if (user.role === 'guest') return false;
    
    const isOwnContent = user._id === response.author._id;
    return canDeleteContent(user.role, isOwnContent);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to respond to this community question
          </p>
          {isSignedIn ? (
            <AddResponseForm 
              communityQuestionId={communityQuestionId}
              communityQuestionTitle={communityQuestionTitle || 'this community'}
              onSuccess={refreshResponses}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6">
              <h4 className="text-lg font-semibold mb-2">You need to be signed in to add a response</h4>
              <Button onClick={() => clerkUser?.signIn()} className="h-10 px-6">
                Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Responses ({responses.length})</h2>
        {isSignedIn ? (
          <AddResponseForm 
            communityQuestionId={communityQuestionId}
            communityQuestionTitle={communityQuestionTitle || 'this community'}
            onSuccess={refreshResponses}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6">
            <h4 className="text-lg font-semibold mb-2">You need to be signed in to add a response</h4>
            <Button onClick={() => clerkUser?.signIn()} className="h-10 px-6">
              Sign In
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {responses.map((response) => (
          <Card key={response._id} className={`${response.isApproved ? 'border-green-200 bg-green-50' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {response.isApproved && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <Badge variant={response.isApproved ? 'default' : 'secondary'}>
                      {response.isApproved ? 'Teacher Approved' : 'Pending Approval'}
                    </Badge>
                    <Badge variant="outline">
                      Response
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl mb-2">
                    {response.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserAvatar 
                        user={response.author}
                        size="sm"
                        className="w-6 h-6"
                      />
                      <ProfileLink 
                        userId={response.author._id}
                        username={response.author.username}
                      >
                        {response.author.username}
                      </ProfileLink>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(response.publishedAt).toLocaleDateString()}</span>
                    </div>
                    {response.isApproved && response.approvedBy && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Approved by {response.approvedBy.username}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons - compact responsive layout */}
                <div className="flex flex-wrap items-center gap-1 ml-4">
                  {/* Always visible primary actions */}
                  <Link href={`/responses/${response._id}`}>
                    <Button size="sm" variant="outline" className="h-8 px-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  {isSignedIn && (
                    <FavoriteButton 
                      postId={response._id}
                      postType="response"
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                    />
                  )}

                  {/* Conditional actions - compact on mobile */}
                  {canEdit(response) && (
                    <EditResponseButton
                      responseId={response._id}
                      currentTitle={response.title}
                      currentBody={response.body}
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onSuccess={refreshResponses}
                    />
                  )}
                  {canDelete(response) && (
                    <DeleteResponseButton
                      responseId={response._id}
                      responseTitle={response.title}
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onSuccess={refreshResponses}
                    />
                  )}
                  {canApprove && (
                    <ApproveResponseButton
                      responseId={response._id}
                      isApproved={response.isApproved}
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onSuccess={refreshResponses}
                    />
                  )}
                  <ReportButton
                    contentId={response._id}
                    contentType="post"
                    contentTitle={response.title}
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose max-w-none">
                {/* Render response body content */}
                {response.body ? (
                  <RichContentRenderer 
                    content={typeof response.body === 'string' 
                      ? response.body 
                      : response.body.map((block: any) => 
                          block.children?.map((child: any) => child.text).join('') || ''
                        ).join('\n')
                    }
                    className="text-gray-700 leading-relaxed"
                  />
                ) : (
                  <p className="text-gray-600">No content available</p>
                )}
              </div>

              {response.image && (
                <div className="mt-4">
                  <img
                    src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${response.image.asset?._ref?.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`}
                    alt="Response image"
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 