import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';
import { isAdmin } from '@/lib/auth/roles';

export interface AdminSettings {
  // General Settings
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  guestAccess: boolean;
  maxFileSize: string;
  maxPostsPerDay: number;
  autoModeration: boolean;
  emailNotifications: boolean;
  analyticsEnabled: boolean;
  
  // Security Settings
  requireEmailVerification: boolean;
  requireTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  enableRateLimiting: boolean;
  enableAuditLog: boolean;
  enableBackup: boolean;
  
  // Database Settings
  backupFrequency: string;
  retentionPeriod: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  maxConnections: number;
  
  // Email Settings
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableEmailNotifications: boolean;
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN SETTINGS API CALLED ===");
    
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin role (only admins can access settings)
    if (!isAdmin(user.role)) {
      console.error("User does not have admin role:", user.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get settings from Sanity (or return default settings)
    const settingsQuery = `*[_type == "adminSettings"][0]`;
    const settings = await adminClient.fetch(settingsQuery);

    const defaultSettings: AdminSettings = {
      // General Settings
      siteName: 'DOM Project',
      siteDescription: 'A platform for biblical discussion and community',
      maintenanceMode: false,
      registrationEnabled: true,
      guestAccess: true,
      maxFileSize: '10MB',
      maxPostsPerDay: 10,
      autoModeration: true,
      emailNotifications: true,
      analyticsEnabled: true,
      
      // Security Settings
      requireEmailVerification: true,
      requireTwoFactor: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      enableRateLimiting: true,
      enableAuditLog: true,
      enableBackup: true,
      
      // Database Settings
      backupFrequency: 'daily',
      retentionPeriod: 30,
      enableCompression: true,
      enableEncryption: true,
      maxConnections: 100,
      
      // Email Settings
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@domproject.com',
      fromName: 'DOM Project',
      enableEmailNotifications: true
    };

    return NextResponse.json({
      success: true,
      settings: settings || defaultSettings
    });

  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin role
    if (!isAdmin(user.role)) {
      console.error("User does not have admin role:", user.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { section, settings } = body;

    if (!section || !settings) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get existing settings
    const existingSettingsQuery = `*[_type == "adminSettings"][0]`;
    const existingSettings = await adminClient.fetch(existingSettingsQuery);

    let updatedSettings;
    if (existingSettings) {
      // Update existing settings
      updatedSettings = await adminClient
        .patch(existingSettings._id)
        .set({
          ...existingSettings,
          ...settings,
          updatedAt: new Date().toISOString(),
          updatedBy: {
            _type: 'reference',
            _ref: user._id
          }
        })
        .commit();
    } else {
      // Create new settings document
      updatedSettings = await adminClient.create({
        _type: 'adminSettings',
        ...settings,
        createdAt: new Date().toISOString(),
        createdBy: {
          _type: 'reference',
          _ref: user._id
        },
        updatedAt: new Date().toISOString(),
        updatedBy: {
          _type: 'reference',
          _ref: user._id
        }
      });
    }

    console.log("Settings updated:", section);

    return NextResponse.json({
      success: true,
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to update admin settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin role (only admins can delete the app)
    if (!isAdmin(user.role)) {
      console.error("User does not have admin role:", user.role);
      return NextResponse.json({ error: 'Admin access required for app deletion' }, { status: 403 });
    }

    const body = await request.json();
    const { confirmation } = body;

    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Invalid confirmation code' }, { status: 400 });
    }

    // This is a very dangerous operation - in a real app, you'd want additional safeguards
    console.log("APP DELETION INITIATED BY ADMIN:", user.username);

    // In a real implementation, you would:
    // 1. Create a backup
    // 2. Notify all users
    // 3. Gradually shut down services
    // 4. Delete all data
    // 5. Shut down the application

    return NextResponse.json({
      success: true,
      message: 'App deletion process initiated. This action cannot be undone.'
    });

  } catch (error) {
    console.error('Error in app deletion:', error);
    return NextResponse.json(
      { error: 'Failed to initiate app deletion' },
      { status: 500 }
    );
  }
}