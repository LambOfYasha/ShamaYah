const { createClient } = require('@sanity/client');

// Create a Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_ADMIN_API_TOKEN, // Use admin token for write access
  useCdn: false,
});

async function createTestCommunities() {
  try {
    console.log('Creating test communities...');

    // First, get a user to use as moderator
    const users = await client.fetch(`*[_type == "user"] | order(_createdAt asc)[0]`);
    
    if (!users) {
      console.log('No users found. Please create a user first.');
      return;
    }

    console.log(`Using user ${users.username} as moderator`);

    const testCommunities = [
      {
        _type: 'communityQuestion',
        title: 'Biblical Studies',
        description: 'Deep dive into biblical texts, interpretation, and theological discussions.',
        slug: { _type: 'slug', current: 'biblical-studies' },
        status: 'active',
        isActive: true,
        isPrivate: false,
        requireApproval: false,
        allowGuestPosts: true,
        maxPostsPerDay: 10,
        maxMembers: 1000,
        autoModeration: true,
        contentGuidelines: 'Respectful discussion of biblical texts and interpretations.',
        moderator: {
          _type: 'reference',
          _ref: users._id
        },
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isDeleted: false
      },
      {
        _type: 'communityQuestion',
        title: 'Spiritual Life',
        description: 'Sharing personal spiritual experiences and growth journeys.',
        slug: { _type: 'slug', current: 'spiritual-life' },
        status: 'active',
        isActive: true,
        isPrivate: false,
        requireApproval: true,
        allowGuestPosts: false,
        maxPostsPerDay: 5,
        maxMembers: 500,
        autoModeration: true,
        contentGuidelines: 'Share your spiritual journey with respect and authenticity.',
        moderator: {
          _type: 'reference',
          _ref: users._id
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        lastActivity: new Date().toISOString(),
        isDeleted: false
      },
      {
        _type: 'communityQuestion',
        title: 'Church History',
        description: 'Exploring the rich history of Christianity and church development.',
        slug: { _type: 'slug', current: 'church-history' },
        status: 'moderated',
        isActive: true,
        isPrivate: false,
        requireApproval: true,
        allowGuestPosts: false,
        maxPostsPerDay: 3,
        maxMembers: 300,
        autoModeration: false,
        contentGuidelines: 'Historical discussion of church development and events.',
        moderator: {
          _type: 'reference',
          _ref: users._id
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        lastActivity: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        isDeleted: false
      },
      {
        _type: 'communityQuestion',
        title: 'Theology Discussion',
        description: 'Academic and practical discussions of theological concepts.',
        slug: { _type: 'slug', current: 'theology-discussion' },
        status: 'active',
        isActive: true,
        isPrivate: false,
        requireApproval: false,
        allowGuestPosts: true,
        maxPostsPerDay: 15,
        maxMembers: 2000,
        autoModeration: true,
        contentGuidelines: 'Academic theological discussions with proper citations.',
        moderator: {
          _type: 'reference',
          _ref: users._id
        },
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        lastActivity: new Date().toISOString(),
        isDeleted: false
      },
      {
        _type: 'communityQuestion',
        title: 'Personal Growth',
        description: 'Supporting each other in personal and spiritual development.',
        slug: { _type: 'slug', current: 'personal-growth' },
        status: 'suspended',
        isActive: false,
        isPrivate: false,
        requireApproval: true,
        allowGuestPosts: false,
        maxPostsPerDay: 2,
        maxMembers: 100,
        autoModeration: true,
        contentGuidelines: 'Supportive environment for personal development.',
        moderator: {
          _type: 'reference',
          _ref: users._id
        },
        createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        lastActivity: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        isDeleted: false
      }
    ];

    for (const community of testCommunities) {
      try {
        const createdCommunity = await client.create(community);
        console.log(`✅ Created community: ${createdCommunity.title} (${createdCommunity._id})`);
      } catch (error) {
        console.error(`❌ Error creating community ${community.title}:`, error);
      }
    }

    console.log('✅ Test communities created successfully!');
    console.log('You can now visit /admin/communities to see the data.');

  } catch (error) {
    console.error('❌ Error creating test communities:', error);
  }
}

// Run the script
createTestCommunities(); 