'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Shield,
  Database,
  Users,
  Trash2,
  AlertTriangle,
  Save,
  RefreshCw,
  Lock,
  Globe,
  Bell,
  Key,
  Server,
  Activity,
  FileText,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type AdminSettings as AdminSettingsValues, DEFAULT_ADMIN_SETTINGS, canManageAdminSettings } from '@/lib/admin-settings';

interface AdminSettingsProps {
  userRole: string;
}

export default function AdminSettings({ userRole }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const canEditSettings = canManageAdminSettings(userRole);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    siteName: DEFAULT_ADMIN_SETTINGS.siteName,
    siteDescription: DEFAULT_ADMIN_SETTINGS.siteDescription,
    maintenanceMode: DEFAULT_ADMIN_SETTINGS.maintenanceMode,
    registrationEnabled: DEFAULT_ADMIN_SETTINGS.registrationEnabled,
    guestAccess: DEFAULT_ADMIN_SETTINGS.guestAccess,
    maxFileSize: DEFAULT_ADMIN_SETTINGS.maxFileSize,
    maxPostsPerDay: DEFAULT_ADMIN_SETTINGS.maxPostsPerDay,
    autoModeration: DEFAULT_ADMIN_SETTINGS.autoModeration,
    emailNotifications: DEFAULT_ADMIN_SETTINGS.emailNotifications,
    analyticsEnabled: DEFAULT_ADMIN_SETTINGS.analyticsEnabled
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: DEFAULT_ADMIN_SETTINGS.requireEmailVerification,
    requireTwoFactor: DEFAULT_ADMIN_SETTINGS.requireTwoFactor,
    sessionTimeout: DEFAULT_ADMIN_SETTINGS.sessionTimeout,
    maxLoginAttempts: DEFAULT_ADMIN_SETTINGS.maxLoginAttempts,
    passwordMinLength: DEFAULT_ADMIN_SETTINGS.passwordMinLength,
    enableRateLimiting: DEFAULT_ADMIN_SETTINGS.enableRateLimiting,
    enableAuditLog: DEFAULT_ADMIN_SETTINGS.enableAuditLog,
    enableBackup: DEFAULT_ADMIN_SETTINGS.enableBackup
  });

  // Database Settings State
  const [databaseSettings, setDatabaseSettings] = useState({
    backupFrequency: DEFAULT_ADMIN_SETTINGS.backupFrequency,
    retentionPeriod: DEFAULT_ADMIN_SETTINGS.retentionPeriod,
    enableCompression: DEFAULT_ADMIN_SETTINGS.enableCompression,
    enableEncryption: DEFAULT_ADMIN_SETTINGS.enableEncryption,
    maxConnections: DEFAULT_ADMIN_SETTINGS.maxConnections
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: DEFAULT_ADMIN_SETTINGS.smtpHost,
    smtpPort: DEFAULT_ADMIN_SETTINGS.smtpPort,
    smtpUsername: DEFAULT_ADMIN_SETTINGS.smtpUsername,
    smtpPassword: DEFAULT_ADMIN_SETTINGS.smtpPassword,
    fromEmail: DEFAULT_ADMIN_SETTINGS.fromEmail,
    fromName: DEFAULT_ADMIN_SETTINGS.fromName,
    enableEmailNotifications: DEFAULT_ADMIN_SETTINGS.enableEmailNotifications
  });

  function syncSettings(settings: AdminSettingsValues) {
    setSystemSettings({
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      maintenanceMode: settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled,
      guestAccess: settings.guestAccess,
      maxFileSize: settings.maxFileSize,
      maxPostsPerDay: settings.maxPostsPerDay,
      autoModeration: settings.autoModeration,
      emailNotifications: settings.emailNotifications,
      analyticsEnabled: settings.analyticsEnabled,
    });

    setSecuritySettings({
      requireEmailVerification: settings.requireEmailVerification,
      requireTwoFactor: settings.requireTwoFactor,
      sessionTimeout: settings.sessionTimeout,
      maxLoginAttempts: settings.maxLoginAttempts,
      passwordMinLength: settings.passwordMinLength,
      enableRateLimiting: settings.enableRateLimiting,
      enableAuditLog: settings.enableAuditLog,
      enableBackup: settings.enableBackup,
    });

    setDatabaseSettings({
      backupFrequency: settings.backupFrequency,
      retentionPeriod: settings.retentionPeriod,
      enableCompression: settings.enableCompression,
      enableEncryption: settings.enableEncryption,
      maxConnections: settings.maxConnections,
    });

    setEmailSettings({
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpUsername: settings.smtpUsername,
      smtpPassword: settings.smtpPassword,
      fromEmail: settings.fromEmail,
      fromName: settings.fromName,
      enableEmailNotifications: settings.enableEmailNotifications,
    });
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setLoading(true);

      try {
        const response = await fetch('/api/admin/settings', {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load admin settings.');
        }

        if (isMounted) {
          syncSettings({ ...DEFAULT_ADMIN_SETTINGS, ...data.settings });
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to load admin settings.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleSaveSettings = async (section: string) => {
    if (!canEditSettings) {
      toast({
        title: 'Unavailable',
        description: 'Only admin and dev roles can save system settings.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const normalizedSection = section.toLowerCase();
      const settings = normalizedSection === 'general'
        ? systemSettings
        : normalizedSection === 'security'
          ? securitySettings
          : normalizedSection === 'database'
            ? databaseSettings
            : emailSettings;

      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: normalizedSection,
          settings,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to save ${section} settings.`);
      }

      syncSettings({ ...DEFAULT_ADMIN_SETTINGS, ...data.settings });
      
      toast({
        title: 'Settings Saved',
        description: `${section} settings have been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApp = async () => {
    setLoading(true);
    try {
      // This would be a very dangerous operation in real app
      // Only admins should be able to access this
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'App Deletion Initiated',
        description: 'The application deletion process has been started. This action cannot be undone.',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate app deletion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userRole === 'admin';
  const isDev = userRole === 'dev';
  const isLeadTeacher = userRole === 'lead_teacher';

  return (
    <div className="space-y-6">
      {/* Role-based Access Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isAdmin ? 'default' : isDev ? 'secondary' : 'outline'}>
              {userRole.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-600">
              {isAdmin ? 'Full administrative access including app deletion' :
               isDev ? 'Developer access with system configuration' :
               'Lead teacher access with limited administrative functions'}
            </span>
          </div>
          {!canEditSettings ? (
            <p className="mt-3 text-sm text-gray-600">
              Only admin and dev roles can turn maintenance mode on or off and save settings changes.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          {isAdmin && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={systemSettings.siteDescription}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxFileSize">Maximum File Size</Label>
                    <Select value={systemSettings.maxFileSize} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, maxFileSize: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5MB">5MB</SelectItem>
                        <SelectItem value="10MB">10MB</SelectItem>
                        <SelectItem value="25MB">25MB</SelectItem>
                        <SelectItem value="50MB">50MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxPostsPerDay">Maximum Posts Per Day</Label>
                    <Input
                      id="maxPostsPerDay"
                      type="number"
                      value={systemSettings.maxPostsPerDay}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxPostsPerDay: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">Temporarily disable the site for maintenance</p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                      disabled={loading || !canEditSettings}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Registration Enabled</Label>
                      <p className="text-sm text-gray-600">Allow new users to register</p>
                    </div>
                    <Switch
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Guest Access</Label>
                      <p className="text-sm text-gray-600">Allow guest users to view content</p>
                    </div>
                    <Switch
                      checked={systemSettings.guestAccess}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, guestAccess: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Moderation</Label>
                      <p className="text-sm text-gray-600">Enable automatic content moderation</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoModeration}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoModeration: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Send email notifications to users</p>
                    </div>
                    <Switch
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analytics Enabled</Label>
                      <p className="text-sm text-gray-600">Collect usage analytics</p>
                    </div>
                    <Switch
                      checked={systemSettings.analyticsEnabled}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, analyticsEnabled: checked }))}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSaveSettings('General')} disabled={loading || !canEditSettings}>
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Verification Required</Label>
                      <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireEmailVerification}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireTwoFactor}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rate Limiting</Label>
                      <p className="text-sm text-gray-600">Enable rate limiting for API requests</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableRateLimiting}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableRateLimiting: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-gray-600">Log all administrative actions</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableAuditLog}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableAuditLog: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-gray-600">Enable automatic database backups</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableBackup}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableBackup: checked }))}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSaveSettings('Security')} disabled={loading || !canEditSettings}>
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={databaseSettings.backupFrequency} onValueChange={(value) => setDatabaseSettings(prev => ({ ...prev, backupFrequency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                    <Input
                      id="retentionPeriod"
                      type="number"
                      value={databaseSettings.retentionPeriod}
                      onChange={(e) => setDatabaseSettings(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxConnections">Maximum Connections</Label>
                    <Input
                      id="maxConnections"
                      type="number"
                      value={databaseSettings.maxConnections}
                      onChange={(e) => setDatabaseSettings(prev => ({ ...prev, maxConnections: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Compression</Label>
                      <p className="text-sm text-gray-600">Compress database backups</p>
                    </div>
                    <Switch
                      checked={databaseSettings.enableCompression}
                      onCheckedChange={(checked) => setDatabaseSettings(prev => ({ ...prev, enableCompression: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Encryption</Label>
                      <p className="text-sm text-gray-600">Encrypt database backups</p>
                    </div>
                    <Switch
                      checked={databaseSettings.enableEncryption}
                      onCheckedChange={(checked) => setDatabaseSettings(prev => ({ ...prev, enableEncryption: checked }))}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSaveSettings('Database')} disabled={loading || !canEditSettings}>
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Database Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Email Notifications</Label>
                      <p className="text-sm text-gray-600">Send email notifications to users</p>
                    </div>
                    <Switch
                      checked={emailSettings.enableEmailNotifications}
                      onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableEmailNotifications: checked }))}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSaveSettings('Email')} disabled={loading || !canEditSettings}>
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Delete Application</h3>
                  <p className="text-sm text-red-700 mb-4">
                    This action will permanently delete the entire application, including all data, users, and content. 
                    This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Application
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the entire application and all associated data. 
                          This action cannot be undone. Please type "DELETE" to confirm.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteApp}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Application
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}