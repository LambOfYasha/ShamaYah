"use client"
// Client component for the sidebar
import * as React from "react"
import { Minus, Plus, LayoutDashboard, User, Heart, Users, Settings, BookOpen } from "lucide-react"
import { useAuth, useUser } from "@clerk/nextjs"

import { SearchForm } from "@/components/search-form"
import { Suspense } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import CreateCommunityButton from "./header/CreateCommunityButton"
import CreateBlogButton from "./header/CreateBlogButton"

// Member navigation items
const memberNavigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Favorites",
    url: "/dashboard/favorites",
    icon: Heart,
  },
  {
    title: "Communities",
    url: "/dashboard/communities",
    icon: Users,
  },
  {
    title: "Blog",
    url: "/dashboard/blogs",
    icon: BookOpen,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [communities, setCommunities] = React.useState([]);
  const [blogs, setBlogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [blogsLoading, setBlogsLoading] = React.useState(true);
  const [hasFetched, setHasFetched] = React.useState(false);
  const [hasFetchedBlogs, setHasFetchedBlogs] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  // Fetch user role on client side
  React.useEffect(() => {
    async function fetchUserRole() {
      if (user) {
        try {
          const response = await fetch('/api/user/role');
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.role);
          } else {
            console.error('Failed to fetch user role:', response.status);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      }
    }

    fetchUserRole();
  }, [user]);

  // Fetch communities on client side
  React.useEffect(() => {
    // Prevent multiple fetches
    if (hasFetched) return;

    async function fetchCommunities() {
      try {
        setLoading(true);
        const response = await fetch('/api/communities');
        if (response.ok) {
          const data = await response.json();
          setCommunities(data);
        } else {
          console.error('Failed to fetch communities:', response.status);
          setCommunities([]);
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error);
        setCommunities([]);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    }

    fetchCommunities();
  }, [hasFetched]); // Only depend on hasFetched to prevent infinite loops

  // Fetch blogs on client side
  React.useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedBlogs) return;

    async function fetchBlogs() {
      try {
        setBlogsLoading(true);
        const response = await fetch('/api/blogs');
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
        } else {
          console.error('Failed to fetch blogs:', response.status);
          setBlogs([]);
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        setBlogs([]);
      } finally {
        setBlogsLoading(false);
        setHasFetchedBlogs(true);
      }
    }

    fetchBlogs();
  }, [hasFetchedBlogs]); // Only depend on hasFetchedBlogs to prevent infinite loops

  // Check if user can create blogs (admin or teacher)
  const canCreateBlogs = userRole === "admin" || userRole === "teacher" || userRole === "junior_teacher" || userRole === "senior_teacher" || userRole === "lead_teacher";
  
  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
          {/* TODO: Add logo */}
          </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Suspense fallback={<div className="p-4">Loading search...</div>}>
          <SearchForm />
        </Suspense>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <CreateCommunityButton />
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Only show CreateBlogButton for admins and teachers */}
            {canCreateBlogs && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <CreateBlogButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        
        {/* Member Dashboard Navigation - Only show when signed in */}
        {isSignedIn && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/favorites">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/communities">
                    <Users className="mr-2 h-4 w-4" />
                    Communities
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/blogs">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Blog
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Community Questions */}
        <SidebarGroup>
          <SidebarMenu>
              <Collapsible
              defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                    Community Questions{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                {!loading && communities.length > 0 && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                      {communities.map((community: any) => (
                        <SidebarMenuSubItem key={community._id}>
                            <SidebarMenuSubButton
                              asChild
                            isActive={false}
                            >
                            <Link href={`/community-questions/${community.slug?.current || community.slug}`}>
                              {community.title || "Untitled"}
                            </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                )}
                </SidebarMenuItem>
              </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {/* Teacher's Blog */}
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    Teacher's Blog{" "}
                    <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                    <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {!blogsLoading && blogs.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {blogs.map((blog: any) => (
                        <SidebarMenuSubItem key={blog._id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={false}
                          >
                            <Link href={`/blogs/${blog.slug?.current || blog.slug}`}>
                              {blog.title || "Untitled Blog"}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </>
  )
}
