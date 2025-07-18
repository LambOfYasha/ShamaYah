import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Search } from "lucide-react";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Blog Post Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Sorry, the blog post you're looking for doesn't exist or may have been moved.
            </p>
            <div className="space-y-3">
              <Link href="/dashboard/blogs">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blogs
                </Button>
              </Link>
              <Link href="/dashboard/blogs">
                <Button variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Blogs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 