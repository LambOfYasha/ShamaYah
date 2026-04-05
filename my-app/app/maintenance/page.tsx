import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 text-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">We&rsquo;re under maintenance</h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Shama Yah is temporarily unavailable while we perform updates. Please check back soon.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Admin and dev users can still sign in to review the site while maintenance mode is active.
          </p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">Try again</Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/sign-in">Admin / Dev sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
