import { requireAdminOrTeacher } from '@/lib/auth/middleware';
import { client } from '@/sanity/lib/client';
import { defineQuery } from 'groq';
import { redirect } from 'next/navigation';

const usersQuery = defineQuery(`
  *[_type == "user" && isDeleted != true] {
    _id,
    username,
    email,
    role,
    isActive,
    isDeleted
  }
`);

export const dynamic = 'force-dynamic';

export default async function DebugUsersPage() {
  const currentUser = await requireAdminOrTeacher();

  if (!['admin', 'dev'].includes(currentUser.role)) {
    redirect('/unauthorized');
  }

  const users = await client.fetch(usersQuery);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Users</h1>
      <p className="mb-4">Total users found: {users.length}</p>
      
      <div className="space-y-2">
        {users.map((user: any) => (
          <div key={user._id} className="p-4 border rounded">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
            <p><strong>Deleted:</strong> {user.isDeleted ? 'Yes' : 'No'}</p>
            <a 
              href={`/profile/${user._id}`}
              className="text-blue-600 hover:underline"
            >
              View Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 