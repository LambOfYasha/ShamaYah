import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 text-center">
        <div>
          <h1 className="text-4xl sm:text-6xl font-bold text-red-600">403</h1>
          <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/sign-in">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 