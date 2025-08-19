import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Header from "@/components/header/header";
import { SettingsProvider } from "@/contexts/settings-context";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <SettingsProvider>
        <SidebarProvider>
          <Sidebar className="hidden md:block" collapsible="icon">
            <AppSidebar />
          </Sidebar>
          <SidebarInset>
            <Header />
            <div className="flex flex-col min-h-screen">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </SettingsProvider>
    </ClerkProvider>
  );
}
