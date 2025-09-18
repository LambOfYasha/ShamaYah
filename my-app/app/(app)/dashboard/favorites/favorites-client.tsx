'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ProfileLink } from "@/components/ui/profile-link";
import { 
  Heart, 
  Eye, 
  Calendar,
  MessageSquare,
  ArrowLeft,
  AlertCircle,
  Clock
} from "lucide-react";
import DeleteFavoriteButton from "@/components/ui/delete-favorite-button";

interface FavoriteItem {
  _id: string;
  savedAt: string;
  commentPath?: string;
  post?: {
    _id: string;
    _type: string;
    title: string;
    description?: string;
    slug?: { current: string };
    author?: {
      _id: string;
      username: string;
      imageURL?: string;
    };
    moderator?: {
      _id: string;
      username: string;
      imageURL?: string;
    };
  };
  comment?: {
    _id: string;
    content: string;
    author: {
      _id: string;
      username: string;
      imageURL?: string;
    };
    authorRole: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface FavoritesClientProps {
  initialFavorites: FavoriteItem[];
}

export default function FavoritesClient({ initialFavorites }: FavoritesClientProps) {
  const [favorites, setFavorites] = useState(initialFavorites);

  const handleDelete = (favoriteId: string) => {
    setFavorites(prev => prev.filter(fav => fav._id !== favoriteId));
  };

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring content and save your favorite posts here
            </p>
            <Button asChild>
              <Link href="/search">
                Explore Content
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {favorites.map((favorite) => (
        <Card key={favorite._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    {favorite.comment ? (
                      <span className="text-muted-foreground">Comment on: {favorite.post?.title || 'Unknown Post'}</span>
                    ) : (
                      favorite.post?.title || 'Unknown Post'
                    )}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    <Heart className="w-3 h-3 mr-1" />
                    {favorite.comment ? 'Comment' : 'Post'} Favorited
                  </Badge>
                </div>
                
                {favorite.comment ? (
                  // Display comment content
                  <div className="mb-3">
                    <p className="text-foreground mb-2">{favorite.comment.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={favorite.comment.author?.imageURL} />
                          <AvatarFallback className="text-xs">
                            {favorite.comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <ProfileLink 
                          userId={favorite.comment.author?._id || ''}
                          username={favorite.comment.author?.username || ''}
                        >
                          {favorite.comment.author?.username || 'Unknown Author'}
                        </ProfileLink>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Commented {new Date(favorite.comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Display post information
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={favorite.post?.author?.imageURL || favorite.post?.moderator?.imageURL} />
                        <AvatarFallback className="text-xs">
                          {(favorite.post?.author?.username || favorite.post?.moderator?.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ProfileLink 
                        userId={favorite.post?.author?._id || favorite.post?.moderator?._id || ''}
                        username={favorite.post?.author?.username || favorite.post?.moderator?.username || ''}
                      >
                        {favorite.post?.author?.username || favorite.post?.moderator?.username || 'Unknown Author'}
                      </ProfileLink>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Published {new Date(favorite.savedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Favorited on {new Date(favorite.savedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/responses/${favorite.post?.slug?.current || favorite.post?._id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
                <DeleteFavoriteButton 
                  favoriteId={favorite._id}
                  onDelete={() => handleDelete(favorite._id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 