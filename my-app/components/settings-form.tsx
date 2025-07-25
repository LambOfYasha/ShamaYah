"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateUserProfile, updateUserSettings, getUserSettings } from "@/action/settingsActions";
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  Bell,
  Shield,
  Palette,
  Edit,
  Save,
  CheckCircle,
  XCircle,
  Sun,
  Monitor,
  Smartphone,
  Globe,
  Users,
  Database,
  FileText,
  Zap,
  RefreshCw,
  Mail,
  Activity,
  Download,
  Trash2,
  Key,
  Lock
} from "lucide-react";

interface SettingsFormProps {
  user: any;
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || ''
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    moderation: true,
    community: true,
    marketing: false
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public' as 'public' | 'friends' | 'private',
    activityStatus: true,
    contentVisibility: 'public' as 'public' | 'friends' | 'private',
    dataCollection: true
  });
  
  const [appearance, setAppearance] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    compactMode: false,
    reducedMotion: false
  });

  // Load user settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      const result = await getUserSettings();
      if (result.success && result.settings) {
        setNotifications(result.settings.notifications || notifications);
        setPrivacy(result.settings.privacy || privacy);
        setAppearance(result.settings.appearance || appearance);
      }
    };
    loadSettings();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formDataObj = new FormData();
      formDataObj.append('username', formData.username);
      formDataObj.append('email', formData.email);
      formDataObj.append('bio', formData.bio);
      formDataObj.append('location', formData.location);
      formDataObj.append('website', formData.website);
      
      const result = await updateUserProfile(formDataObj);
      
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
        setHasUnsavedChanges(false);
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSave = async (settingsType: 'notifications' | 'privacy' | 'appearance') => {
    setIsSavingSettings(true);
    
    try {
      let settingsToUpdate: any = {};
      
      switch (settingsType) {
        case 'notifications':
          settingsToUpdate = { notifications };
          break;
        case 'privacy':
          settingsToUpdate = { privacy };
          break;
        case 'appearance':
          settingsToUpdate = { appearance };
          break;
      }
      
      const result = await updateUserSettings(settingsToUpdate);
      
      if (result.success) {
        toast({
          title: "Settings Saved",
          description: `${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings have been saved successfully.`,
        });
        setHasUnsavedChanges(false);
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    setHasUnsavedChanges(true);
  };

  const handlePrivacyToggle = (key: string) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    setHasUnsavedChanges(true);
  };

  const handleAppearanceToggle = (key: string) => {
    setAppearance(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    setHasUnsavedChanges(true);
  };

  const handlePrivacyChange = (key: string, value: string) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleAppearanceChange = (key: string, value: string) => {
    setAppearance(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const exportUserData = () => {
    const data = {
      profile: {
        username: user.username,
        email: user.email,
        role: user.role,
        joinedAt: user.joinedAt,
        bio: user.bio,
        location: user.location,
        website: user.website
      },
      settings: {
        notifications,
        privacy,
        appearance
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.imageURL} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.username}</h3>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">Member since {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Recently'}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                {isEditing ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-gray-600">{user.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </Badge>
                </div>
                {user.bio && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium">Bio</Label>
                    <p className="text-gray-600">{user.bio}</p>
                  </div>
                )}
                {user.location && (
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-gray-600">{user.location}</p>
                  </div>
                )}
                {user.website && (
                  <div>
                    <Label className="text-sm font-medium">Website</Label>
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {user.website}
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications Tab */}
      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationToggle('email')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications in browser</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationToggle('push')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium">Content Moderation</h4>
                    <p className="text-sm text-gray-600">Notifications about content moderation</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.moderation}
                  onCheckedChange={() => handleNotificationToggle('moderation')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Community Updates</h4>
                    <p className="text-sm text-gray-600">Updates from communities you follow</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.community}
                  onCheckedChange={() => handleNotificationToggle('community')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium">Marketing Communications</h4>
                    <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={() => handleNotificationToggle('marketing')}
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={() => handleSettingsSave('notifications')}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy Tab */}
      <TabsContent value="privacy" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-gray-600">Who can see your profile</p>
                  </div>
                </div>
                <Select value={privacy.profileVisibility} onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Activity Status</h4>
                    <p className="text-sm text-gray-600">Show when you're online</p>
                  </div>
                </div>
                <Switch
                  checked={privacy.activityStatus}
                  onCheckedChange={() => handlePrivacyToggle('activityStatus')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Content Visibility</h4>
                    <p className="text-sm text-gray-600">Who can see your posts</p>
                  </div>
                </div>
                <Select value={privacy.contentVisibility} onValueChange={(value) => handlePrivacyChange('contentVisibility', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium">Data Collection</h4>
                    <p className="text-sm text-gray-600">Allow analytics and tracking</p>
                  </div>
                </div>
                <Switch
                  checked={privacy.dataCollection}
                  onCheckedChange={() => handlePrivacyToggle('dataCollection')}
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={() => handleSettingsSave('privacy')}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Privacy Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Appearance Tab */}
      <TabsContent value="appearance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-gray-600">Choose your preferred theme</p>
                  </div>
                </div>
                <Select value={appearance.theme} onValueChange={(value) => handleAppearanceChange('theme', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Font Size</h4>
                    <p className="text-sm text-gray-600">Adjust text size</p>
                  </div>
                </div>
                <Select value={appearance.fontSize} onValueChange={(value) => handleAppearanceChange('fontSize', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Compact Mode</h4>
                    <p className="text-sm text-gray-600">Use compact layout</p>
                  </div>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={() => handleAppearanceToggle('compactMode')}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Reduced Motion</h4>
                    <p className="text-sm text-gray-600">Reduce animations and transitions</p>
                  </div>
                </div>
                <Switch
                  checked={appearance.reducedMotion}
                  onCheckedChange={() => handleAppearanceToggle('reducedMotion')}
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={() => handleSettingsSave('appearance')}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Appearance Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Change Password</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button>Update Password</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-gray-600">Manage your active sessions</p>
                    </div>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Data & Export Tab */}
      <TabsContent value="data" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-gray-600">Download a copy of your data</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={exportUserData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-gray-600">Permanently delete your account and data</p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
} 