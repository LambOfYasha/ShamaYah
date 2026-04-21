import { adminClient } from "@/sanity/lib/adminClient";

export async function makeUserAdmin(userId: string) {
  try {
    console.log(`Making user ${userId} admin`);

    if (!process.env.SANITY_ADMIN_API_TOKEN) {
      throw new Error("SANITY_ADMIN_API_TOKEN is not configured");
    }

    // Update the user document to admin role
    const updatedUser = await adminClient
      .patch(userId)
      .set({ role: "admin" })
      .commit();

    console.log(`User ${userId} is now admin`);
    return updatedUser;
  } catch (error) {
    console.error("Error making user admin:", error);
    throw error;
  }
}

export async function makeFirstUserAdmin() {
  try {
    console.log("Making first user admin");

    if (!process.env.SANITY_ADMIN_API_TOKEN) {
      throw new Error("SANITY_ADMIN_API_TOKEN is not configured");
    }

    // Get the first user in the system
    const users = await adminClient.fetch(
      `*[_type == "user"] | order(_createdAt asc)[0]`
    );

    if (!users) {
      throw new Error("No users found in the system");
    }

    // Make the first user admin
    const updatedUser = await adminClient
      .patch(users._id)
      .set({ role: "admin" })
      .commit();

    console.log(`First user ${users._id} is now admin`);
    return updatedUser;
  } catch (error) {
    console.error("Error making first user admin:", error);
    throw error;
  }
} 