const { createClient } = require('@sanity/client');

// Create a Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_ADMIN_API_TOKEN, // Use admin token for write access
  useCdn: false,
});

async function createTestPostsAndFavorites() {
  try {
    console.log('Creating test posts and favorites...');

    // Get communities
    const communities = await client.fetch(`*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null)]`);
    
    if (!communities || communities.length === 0) {
      console.log('No communities found. Please create communities first.');
      return;
    }

    // Get users
    const users = await client.fetch(`*[_type == "user"]`);
    
    if (!users || users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    console.log(`Found ${communities.length} communities and ${users.length} users`);

    // Create test posts for each community
    for (const community of communities) {
      const numPosts = Math.floor(Math.random() * 5) + 1; // 1-5 posts per community
      
      for (let i = 0; i < numPosts; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        const post = {
          _type: 'post',
          title: `Test Post ${i + 1} in ${community.title}`,
          content: `This is a test post ${i + 1} for the ${community.title} community.`,
          communityQuestion: {
            _type: 'reference',
            _ref: community._id
          },
          author: {
            _type: 'reference',
            _ref: randomUser._id
          },
          createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time in last 24 hours
          isDeleted: false
        };

        try {
          const createdPost = await client.create(post);
          console.log(`✅ Created post: ${createdPost.title} for ${community.title}`);
        } catch (error) {
          console.error(`❌ Error creating post for ${community.title}:`, error);
        }
      }
    }

    // Create test favorites (members) for each community
    for (const community of communities) {
      const numMembers = Math.floor(Math.random() * 20) + 5; // 5-25 members per community
      
      for (let i = 0; i < numMembers; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        const favorite = {
          _type: 'favorite',
          post: {
            _type: 'reference',
            _ref: community._id
          },
          user: {
            _type: 'reference',
            _ref: randomUser._id
          },
          createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          isActive: true
        };

        try {
          const createdFavorite = await client.create(favorite);
          console.log(`✅ Created favorite for ${community.title} by ${randomUser.username}`);
        } catch (error) {
          console.error(`❌ Error creating favorite for ${community.title}:`, error);
        }
      }
    }

    console.log('✅ Test posts and favorites created successfully!');
    console.log('You can now visit /admin/communities to see the updated data with member and post counts.');

  } catch (error) {
    console.error('❌ Error creating test posts and favorites:', error);
  }
}

// Run the script
createTestPostsAndFavorites(); 