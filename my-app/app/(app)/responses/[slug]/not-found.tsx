import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft } from 'lucide-react';

export default function ResponseNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Response Not Found</CardTitle>
          <p className="text-gray-600 mt-2">
            The community response you're looking for doesn't exist or has been removed.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              The response may have been deleted, or the URL might be incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/community-questions">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Community Questions
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 