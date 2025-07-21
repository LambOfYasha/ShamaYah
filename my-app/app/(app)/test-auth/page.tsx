import { auth, currentUser } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';

export default async function TestAuthPage() {
  try {
    const authResult = await auth();
    const currentUserResult = await currentUser();
    const userResult = await getUser();

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Auth Result:</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(authResult, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Current User Result:</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(currentUserResult, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">User Result:</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(userResult, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test - Error</h1>
        <div className="bg-red-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error:</h2>
          <pre className="text-sm">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    );
  }
} 