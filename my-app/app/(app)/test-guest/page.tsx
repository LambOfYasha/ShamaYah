import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, BookOpen, Users } from "lucide-react";

export default function TestGuestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Guest Access Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the guest functionality by viewing posts and making comments without signing in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <CardTitle>Blog Posts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View blog posts and leave comments as a guest user.
              </p>
              <Button asChild className="w-full">
                <Link href="/blogs">
                  View Blogs
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-600" />
                <CardTitle>Community Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Explore community discussions and participate as a guest.
              </p>
              <Button asChild className="w-full">
                <Link href="/community-questions">
                  View Communities
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <CardTitle>Search</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Search through all content without authentication.
              </p>
              <Button asChild className="w-full">
                <Link href="/search">
                  Search Content
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>How Guest Access Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Viewing Posts</h3>
                <p className="text-gray-600">
                  Guests can view all blog posts and community questions without signing in. 
                  Simply navigate to any post and read the content.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Making Comments</h3>
                <p className="text-gray-600">
                  Guests can leave comments by providing their name. 
                  The system will create a temporary guest account for you.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Creating Community Responses</h3>
                <p className="text-gray-600">
                  Guests can create responses to community questions by providing their name.
                  These responses will be reviewed by teachers before approval.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Searching Content</h3>
                <p className="text-gray-600">
                  Use the search functionality to find specific topics, 
                  authors, or content across all posts and comments.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Limitations</h3>
                <p className="text-gray-600">
                  Guest users cannot create blog posts, edit content, delete content, 
                  favorite posts, access the dashboard, or moderate content. 
                  Sign up for full access to all features.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 