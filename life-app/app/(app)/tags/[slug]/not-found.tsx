import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TagNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tag Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The tag you're looking for doesn't exist or may have been removed.
        </p>
        <div className="space-y-4">
          <Button asChild>
            <Link href="/blogs">
              Browse All Blogs
            </Link>
          </Button>
          <div>
            <Button variant="outline" asChild>
              <Link href="/search">
                Search for Content
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 