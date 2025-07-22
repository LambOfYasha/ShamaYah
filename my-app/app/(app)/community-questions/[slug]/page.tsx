import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "groq";
import { CommunityQuestion, Teacher } from "@/sanity.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  User, 
  MessageSquare, 
  Users, 
  ArrowLeft,
  Share,
  Bookmark,
  Edit,
  Settings
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/middleware";
import EditCommunityButton from "@/components/community/EditCommunityButton";
import DeleteCommunityButton from "@/components/community/DeleteCommunityButton";
import EmbeddedCommentSectionWrapper from "@/components/comments/EmbeddedCommentSectionWrapper";
import FavoriteButton from "@/components/ui/favorite-button";
import CommunityResponses from "@/components/community/CommunityResponses";
import { editCommunity } from "@/action/editCommunity";
import { ReportButton } from "@/components/ui/report-button";

interface CommunityQuestionWithModerator extends CommunityQuestion {
  moderator: Teacher;
}

async function getCommunityQuestion(slug: string): Promise<CommunityQuestionWithModerator | null> {
  const query = defineQuery(`
    *[_type == "communityQuestion" && slug.current == $slug && (isDeleted == false || isDeleted == null)][0] {
      ...,
      "moderator": moderator->
    }
  `);

  try {
    const result = await client.fetch(query, { slug });
    return result;
  } catch (error) {
    console.error("Error fetching community question:", error);
    return null;
  }
}

export default async function CommunityQuestionPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const communityQuestion = await getCommunityQuestion(slug);
  const currentUser = await getCurrentUser();

  if (!communityQuestion) {
    notFound();
  }

  // Use the same user object for permission checks
  const user = await getCurrentUser();

  const canEdit = user && (
    user._id === communityQuestion.moderator?._id || 
    user.role === "admin"
  );

  const canDelete = user && (
    user._id === communityQuestion.moderator?._id || 
    user.role === "admin"
  );

  const handleEditCommunity = async (data: {
    title: string;
    description: string;
    slug: string;
    imageBase64?: string;
    imageFilename?: string;
    imageContentType?: string;
  }): Promise<void> => {
    'use server';
    
    const imageData = data.imageBase64 ? {
      base64: data.imageBase64,
      fileName: data.imageFilename!,
      contentType: data.imageContentType!,
    } : null;

    const result = await editCommunity(
      communityQuestion._id,
      data.title,
      data.description,
      data.slug,
      imageData
    );

    if ("error" in result) {
      throw new Error(result.error);
    }
  };





  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard/communities">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Communities
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {communityQuestion.title}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {communityQuestion.description}
              </p>
              
              {/* Meta Information */}
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(communityQuestion.createdAt || communityQuestion._createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Community</span>
                </div>
                {communityQuestion.moderator && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Moderated by {communityQuestion.moderator.username}</span>
                  </div>
                )}
              </div>

              {/* Tags/Categories */}
              {communityQuestion.categories && communityQuestion.categories.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {communityQuestion.categories.map((category: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {canEdit && (
                <EditCommunityButton 
                  community={communityQuestion}
                  onEdit={handleEditCommunity}
                />
              )}
              {canDelete && (
                <DeleteCommunityButton 
                  communityId={communityQuestion._id}
                  communityTitle={communityQuestion.title || 'Untitled Community'}
                />
              )}
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <FavoriteButton 
                postId={communityQuestion._id}
                postType="community"
                size="sm"
                variant="outline"
              />
              <ReportButton 
                contentId={communityQuestion._id}
                contentType="communityQuestion"
                contentTitle={communityQuestion.title}
                size="sm"
                variant="outline"
              />
            </div>
          </div>

          {/* Community Image */}
          {communityQuestion.image && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
              <Image
                src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${communityQuestion.image.asset?._ref?.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`}
                alt={communityQuestion.title || "Community image"}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">About this Community</h2>
          <div className="prose max-w-none">
            {communityQuestion.content ? (
              <div className="text-gray-700 leading-relaxed">
                {/* Render content blocks */}
                {communityQuestion.content.map((block: any, index: number) => (
                  <div key={index} className="mb-4">
                    {block.children?.map((child: any, childIndex: number) => (
                      <span key={childIndex}>{child.text}</span>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                This community is a place for open discussion and learning. 
                Join the conversation and share your thoughts!
              </p>
            )}
          </div>
        </div>

        {/* Community Responses Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <CommunityResponses 
            communityQuestionId={communityQuestion._id} 
            user={user}
            communityQuestionTitle={communityQuestion.title}
          />
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <EmbeddedCommentSectionWrapper
            postId={communityQuestion._id}
            postType="community"
          />
        </div>
      </div>
    </div>
  );
} 