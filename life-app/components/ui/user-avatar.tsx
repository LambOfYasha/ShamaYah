"use client";

import { User } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { useState } from "react";

interface UserAvatarProps {
  user: {
    username: string;
    imageURL?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ user, size = "md", className = "" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full flex items-center justify-center overflow-hidden`}>
        {user.imageURL && !imageError ? (
          <img 
            src={getImageUrl(user.imageURL) || ''} 
            alt={user.username}
            className={`${sizeClasses[size]} rounded-full object-cover`}
            onError={handleImageError}
          />
        ) : (
          <User className={`${iconSizes[size]} text-gray-600`} />
        )}
      </div>
    </div>
  );
} 