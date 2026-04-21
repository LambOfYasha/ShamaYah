'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { adminClient } from '@/sanity/lib/adminClient';
import { revalidatePath } from 'next/cache';

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
    const avatarFile = formData.get('avatar') as File | null;

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
    const existingUser = await adminClient.fetch(existingUserQuery, { 
      username, 
      userId: user._id 
    });

    if (existingUser) {
      return { success: false, error: 'Username is already taken' };
    }

    // Handle avatar upload if provided
    let imageURL = user.imageURL;
    if (avatarFile) {
      try {
        // Upload to Sanity asset
        const asset = await adminClient.assets.upload('image', avatarFile, {
          filename: avatarFile.name,
          contentType: avatarFile.type,
        });

        // Store the asset reference in the correct Sanity format
        imageURL = asset._id;
      } catch (error) {
        console.error('Avatar upload error:', error);
        return { success: false, error: 'Failed to upload avatar image' };
      }
    }

    // Update user in Sanity
    const updatedUser = await adminClient
      .patch(user._id)
      .set({
        username,
        email,
        imageURL,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Revalidate the profile page
    revalidatePath('/dashboard/profile');

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