const { createClient } = require('@sanity/client');

// Create a Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_ADMIN_API_TOKEN, // Use admin token for write access
  useCdn: false,
});

async function makeFirstUserAdmin() {
  try {
    console.log('Making first user admin...');

    // Get the first user in the system
    const users = await client.fetch(
      `*[_type == "user"] | order(_createdAt asc)[0]`
    );

    if (!users) {
      console.log('No users found in the system');
      return;
    }

    console.log(`Found user: ${users.username} (${users._id})`);

    // Make the first user admin
    const updatedUser = await client
      .patch(users._id)
      .set({ role: "admin" })
      .commit();

    console.log(`✅ Successfully made ${updatedUser.username} admin!`);
    console.log(`User ID: ${updatedUser._id}`);
    console.log(`Role: ${updatedUser.role}`);
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  }
}

// Run the script
makeFirstUserAdmin(); 