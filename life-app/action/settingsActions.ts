'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { client } from '@/sanity/lib/client';
import { adminClient } from '@/sanity/lib/adminClient';
import { revalidatePath } from 'next/cache';

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    moderation: boolean;
    community: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    activityStatus: boolean;
    contentVisibility: 'public' | 'friends' | 'private';
    dataCollection: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    reducedMotion: boolean;
  };
}

export async function updateUserSettings(settings: Partial<UserSettings>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getUser();
    if ('error' in user) {
      return { success: false, error: 'User not found' };
    }

    // Update user document with new settings
    const updatedUser = await adminClient
      .patch(user._id)
      .set({
        settings: settings,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Revalidate the settings page
    revalidatePath('/dashboard/settings');

    return { 
      success: true, 
      user: updatedUser 
    };

  } catch (error) {
    console.error('Settings update error:', error);
    return { 
      success: false, 
      error: 'Failed to update settings. Please try again.' 
    };
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getUser();
    if ('error' in user) {
      return { success: false, error: 'User not found' };
    }

    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;
    const location = formData.get('location') as string;
    const website = formData.get('website') as string;

    // Validate inputs
    if (!username || !email) {
      return { success: false, error: 'Username and email are required' };
    }

    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long' };
    }

    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Check if username is already taken by another user
    const existingUserQuery = `*[_type == "user" && username == $username && _id != $userId][0]`;
    const existingUser = await client.fetch(existingUserQuery, { 
      username, 
      userId: user._id 
    });

    if (existingUser) {
      return { success: false, error: 'Username is already taken' };
    }

    // Update user in Sanity
    const updatedUser = await adminClient
      .patch(user._id)
      .set({
        username,
        email,
        bio: bio || '',
        location: location || '',
        website: website || '',
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Revalidate the settings page
    revalidatePath('/dashboard/settings');

    return { 
      success: true, 
      user: updatedUser 
    };

  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      error: 'Failed to update profile. Please try again.' 
    };
  }
}

export async function getUserSettings() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getUser();
    if ('error' in user) {
      return { success: false, error: 'User not found' };
    }

    // Get user document with settings
    const userDoc = await client.fetch(
      `*[_type == "user" && _id == $userId][0]`,
      { userId: user._id }
    );

    return {
      success: true,
      settings: userDoc.settings || {
        notifications: {
          email: true,
          push: true,
          moderation: true,
          community: true,
          marketing: false
        },
        privacy: {
          profileVisibility: 'public',
          activityStatus: true,
          contentVisibility: 'public',
          dataCollection: true
        },
        appearance: {
          theme: 'light',
          fontSize: 'medium',
          compactMode: false,
          reducedMotion: false
        }
      }
    };

  } catch (error) {
    console.error('Get settings error:', error);
    return { 
      success: false, 
      error: 'Failed to load settings. Please try again.' 
    };
  }
} 