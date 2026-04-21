import { adminClient } from "@/sanity/lib/adminClient";
import { UserRole } from "./roles";

export async function assignRole(userId: string, role: UserRole, userType: 'user' | 'teacher' = 'user') {
  try {
    console.log(`Assigning role ${role} to user ${userId}`);

    if (!process.env.SANITY_ADMIN_API_TOKEN) {
      throw new Error("SANITY_ADMIN_API_TOKEN is not configured");
    }

    // Update the user document with the new role
    const updatedUser = await adminClient
      .patch(userId)
      .set({ role })
      .commit();

    console.log(`Role ${role} assigned successfully to user ${userId}`);
    return updatedUser;
  } catch (error) {
    console.error("Error assigning role:", error);
    throw error;
  }
}

export async function promoteToTeacher(userId: string, specializations?: string[]) {
  try {
    console.log(`Promoting user ${userId} to teacher`);

    if (!process.env.SANITY_ADMIN_API_TOKEN) {
      throw new Error("SANITY_ADMIN_API_TOKEN is not configured");
    }

    // First, get the user data
    const user = await adminClient.getDocument(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Create a new teacher document
    const teacherDoc = {
      _type: "teacher",
      id: user.id,
      username: user.username,
      email: user.email,
      imageURL: user.imageURL,
      role: "teacher",
      specializations: specializations || [],
      joinedAt: new Date().toISOString(),
    };

    const newTeacher = await adminClient.create(teacherDoc);

    // Delete the old user document
    await adminClient.delete(userId);

    console.log(`User ${userId} promoted to teacher successfully`);
    return newTeacher;
  } catch (error) {
    console.error("Error promoting user to teacher:", error);
    throw error;
  }
}

export async function demoteToMember(userId: string) {
  try {
    console.log(`Demoting user ${userId} to member`);

    if (!process.env.SANITY_ADMIN_API_TOKEN) {
      throw new Error("SANITY_ADMIN_API_TOKEN is not configured");
    }

    // Update the user to member role
    const updatedUser = await adminClient
      .patch(userId)
      .set({ role: "member" })
      .commit();

    console.log(`User ${userId} demoted to member successfully`);
    return updatedUser;
  } catch (error) {
    console.error("Error demoting user:", error);
    throw error;
  }
} 