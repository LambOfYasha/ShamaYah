'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Settings,
  Shield,
  Users,
  MessageSquare,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Save,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface CommunitySettings {
  _id: string;
  title: string;
  description?: string;
  status: 'active' | 'moderated' | 'suspended' | 'archived';
  isActive: boolean;
  isPrivate: boolean;
  requireApproval: boolean;
  allowGuestPosts: boolean;
  maxPostsPerDay: number;
  maxMembers: number;
  autoModeration: boolean;
  contentGuidelines?: string;
  moderator?: {
    _id: string;
    username: string;
    role: string;
  };
}

interface CommunitySettingsProps {
  communityId: string;
  onSave?: (settings: Partial<CommunitySettings>) => void;
  onCancel?: () => void;
}

export default function CommunitySettings({ communityId, onSave, onCancel }: CommunitySettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<CommunitySettings>({
    _id: communityId,
    title: '',
    description: '',
    status: 'active',
    isActive: true,
    isPrivate: false,
    requireApproval: false,
    allowGuestPosts: true,
    maxPostsPerDay: 10,
    maxMembers: 1000,
    autoModeration: true,
    contentGuidelines: ''
  });

  useEffect(() => {
    loadCommunitySettings();
  }, [communityId]);

  const loadCommunitySettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/communities/${communityId}`);
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.community);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load community settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load community settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/communities', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId,
          updates: settings
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Community settings saved successfully',
        });
        onSave?.(settings);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save community settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save community settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'moderated': return 'secondary';
      case 'suspended': return 'destructive';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={settings.title}
                onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Community title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={settings.description}
                onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Community description"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status and Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Status & Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={settings.status} onValueChange={(value) => setSettings(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="moderated">Moderated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Visibility</label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={settings.isPrivate}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isPrivate: checked }))}
                />
                <span className="text-sm">
                  {settings.isPrivate ? 'Private' : 'Public'}
                </span>
                {settings.isPrivate ? <Lock className="w-4 h-4 text-gray-500" /> : <Unlock className="w-4 h-4 text-gray-500" />}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.isActive}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isActive: checked }))}
            />
            <span className="text-sm">Community is active</span>
            {settings.isActive ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          </div>
        </CardContent>
      </Card>

      {/* Content Moderation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Content Moderation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Max Posts Per Day</label>
              <Input
                type="number"
                value={settings.maxPostsPerDay}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPostsPerDay: parseInt(e.target.value) || 0 }))}
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Members</label>
              <Input
                type="number"
                value={settings.maxMembers}
                onChange={(e) => setSettings(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 0 }))}
                min="1"
                max="10000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.requireApproval}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireApproval: checked }))}
              />
              <span className="text-sm">Require post approval</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.allowGuestPosts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowGuestPosts: checked }))}
              />
              <span className="text-sm">Allow guest posts</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.autoModeration}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoModeration: checked }))}
              />
              <span className="text-sm">Enable auto-moderation</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Content Guidelines</label>
            <Textarea
              value={settings.contentGuidelines}
              onChange={(e) => setSettings(prev => ({ ...prev, contentGuidelines: e.target.value }))}
              placeholder="Community content guidelines and rules..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
} 