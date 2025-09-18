const { createClient } = require('@sanity/client');

// Create a Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_ADMIN_API_TOKEN, // Use admin token for write access
  useCdn: false,
});

async function createTestReports() {
  try {
    console.log('Creating test reports...');

    // Get existing users and content to reference
    const users = await client.fetch(`*[_type == "user"] | order(_createdAt asc)[0...5]`);
    const posts = await client.fetch(`*[_type == "post"] | order(_createdAt asc)[0...5]`);
    const comments = await client.fetch(`*[_type == "comment"] | order(_createdAt asc)[0...5]`);
    const communities = await client.fetch(`*[_type == "communityQuestion"] | order(_createdAt asc)[0...5]`);
    const blogs = await client.fetch(`*[_type == "blog"] | order(_createdAt asc)[0...5]`);

    if (!users.length) {
      console.log('No users found. Please create users first.');
      return;
    }

    const testReports = [
      {
        _type: 'report',
        reason: 'inappropriate',
        description: 'This content contains inappropriate language and should be reviewed.',
        status: 'pending',
        contentType: 'post',
        reportedContent: {
          _type: 'reference',
          _ref: posts[0]?._id || users[0]._id
        },
        reporter: {
          _type: 'reference',
          _ref: users[0]._id
        },
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        updatedAt: new Date().toISOString()
      },
      {
        _type: 'report',
        reason: 'spam',
        description: 'This appears to be spam content with repeated messages.',
        status: 'investigating',
        contentType: 'comment',
        reportedContent: {
          _type: 'reference',
          _ref: comments[0]?._id || users[1]._id
        },
        reporter: {
          _type: 'reference',
          _ref: users[1]._id
        },
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        updatedAt: new Date().toISOString()
      },
      {
        _type: 'report',
        reason: 'harassment',
        description: 'User is harassing other members in the community.',
        status: 'resolved_removed',
        contentType: 'user',
        actionTaken: 'removed',
        reportedContent: {
          _type: 'reference',
          _ref: users[2]._id
        },
        reporter: {
          _type: 'reference',
          _ref: users[0]._id
        },
        reviewedBy: {
          _type: 'reference',
          _ref: users[0]._id
        },
        reviewedAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        reviewNotes: 'Content removed due to harassment. User warned.',
        createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        _type: 'report',
        reason: 'misinformation',
        description: 'This blog post contains false information about biblical topics.',
        status: 'resolved_warning',
        contentType: 'blog',
        actionTaken: 'warned',
        reportedContent: {
          _type: 'reference',
          _ref: blogs[0]?._id || users[3]._id
        },
        reporter: {
          _type: 'reference',
          _ref: users[1]._id
        },
        reviewedBy: {
          _type: 'reference',
          _ref: users[0]._id
        },
        reviewedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        reviewNotes: 'Content reviewed. Author warned about accuracy requirements.',
        createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        _type: 'report',
        reason: 'copyright',
        description: 'This community question appears to contain copyrighted material.',
        status: 'dismissed',
        contentType: 'communityQuestion',
        actionTaken: 'none',
        reportedContent: {
          _type: 'reference',
          _ref: communities[0]?._id || users[4]._id
        },
        reporter: {
          _type: 'reference',
          _ref: users[2]._id
        },
        reviewedBy: {
          _type: 'reference',
          _ref: users[0]._id
        },
        reviewedAt: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        reviewNotes: 'Content reviewed. No copyright violation found.',
        createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
        updatedAt: new Date(Date.now() - 5400000).toISOString()
      },
      {
        _type: 'report',
        reason: 'hate_speech',
        description: 'This comment contains hate speech targeting religious groups.',
        status: 'pending',
        contentType: 'comment',
        reportedContent: {
          _type: 'reference',
          _ref: comments[1]?._id || users[3]._id
        },
        reporter: {
          _type: 'reference',
          _ref: users[3]._id
        },
        createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        updatedAt: new Date().toISOString()
      },
      {
        _type: 'report',
        reason: 'violence',
        description: 'This post promotes violence and should be removed immediately.',
        status: 'resolved_removed',
        contentType: 'post',
        actionTaken: 'removed',
        reportedContent: {
          _type: 'reference',
          _ref: posts[1]?._id || users[4]._id
        },
        reporter: {
          _type: 'reference',
          _ref: users[4]._id
        },
        reviewedBy: {
          _type: 'reference',
          _ref: users[0]._id
        },
        reviewedAt: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
        reviewNotes: 'Content removed due to violence promotion. User suspended.',
        createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        updatedAt: new Date(Date.now() - 2700000).toISOString()
      },
      {
        _type: 'report',
        reason: 'other',
        description: 'This content doesn\'t fit into other categories but needs review.',
        status: 'pending',
        contentType: 'post',
        reportedContent: {
          _type: 'reference',
          _ref: posts[2]?._id || users[0]._id
        },
        reporter: {
          _type: 'reference',
          _ref: users[2]._id
        },
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        updatedAt: new Date().toISOString()
      }
    ];

    console.log(`Creating ${testReports.length} test reports...`);

    const createdReports = [];
    for (const report of testReports) {
      try {
        const createdReport = await client.create(report);
        createdReports.push(createdReport);
        console.log(`✅ Created report: ${report.reason} - ${report.contentType}`);
      } catch (error) {
        console.error(`❌ Failed to create report: ${report.reason}`, error);
      }
    }

    console.log(`\n🎉 Successfully created ${createdReports.length} test reports!`);
    console.log('Reports created with various statuses: pending, investigating, resolved, dismissed');
    console.log('You can now test the moderation system in the admin panel.');

  } catch (error) {
    console.error('❌ Error creating test reports:', error);
  }
}

// Run the script
createTestReports(); 