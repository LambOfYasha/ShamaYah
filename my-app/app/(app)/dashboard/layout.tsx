import { getCurrentUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-muted">
      <main className="flex-1 pb-6">
        {children}
      </main>
    </div>
  );
} 