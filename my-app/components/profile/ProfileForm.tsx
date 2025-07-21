'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Edit, 
  Save,
  Camera,
  X,
  Upload,
  Loader2
} from "lucide-react";
import { updateUserProfile } from "@/action/profileActions";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from '@/lib/utils';

interface ProfileFormProps {
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
    imageURL?: string;
  };
  memberSince: string;
}

export default function ProfileForm({ user, memberSince }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // Initialize with the user's image URL, which might be a base64 URL from Clerk
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.imageURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const result = await updateUserProfile(formDataToSend);
      
      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        setIsEditing(false);
        setAvatarFile(null);
        // Update the preview with the new image URL
        if (result.user?.imageURL) {
          setAvatarPreview(getImageUrl(result.user.imageURL));
        }
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email,
    });
    setAvatarFile(null);
    setAvatarPreview(getImageUrl(user.imageURL || ''));
    setIsEditing(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img 
                  src={getImageUrl(avatarPreview) || ''} 
                  alt={formData.username}
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to user icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    const userIcon = e.currentTarget.parentElement?.querySelector('.user-icon');
                    if (userIcon) {
                      userIcon.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              {!avatarPreview && (
                <User className="w-8 h-8 text-gray-600 user-icon" />
              )}
            </div>
            {isEditing && (
              <Button 
                size="sm" 
                variant="outline" 
                className="absolute -bottom-1 -right-1"
                onClick={triggerFileInput}
                disabled={isLoading}
              >
                <Camera className="w-3 h-3" />
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{formData.username}</h3>
            <Badge variant="secondary" className="mt-1">
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={!isEditing || isLoading}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing || isLoading}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role} disabled />
          </div>
          <div>
            <Label htmlFor="joined">Joined</Label>
            <Input id="joined" value={memberSince} disabled />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 