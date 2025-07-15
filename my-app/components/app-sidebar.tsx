// Client component for the sidebar
import * as React from "react"
import { Minus, Plus } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
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

type SidebarData = {
  navMain: {
    title: string
    url: string
    items: {
      title: string
      url: string
      isActive: boolean
    }[]
    }[]
  
  }


function AppSidebarClient({ sidebarData }: { sidebarData: SidebarData }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
          {/* TODO: Add logo */}
          <Link href="/">
            
          </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <CreateCommunityButton />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarData.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                            >
                              <a href={item.url}>{item.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

// Server component to fetch data
async function SidebarDataProvider() {
  // Import getCommunities here to keep it server-side only
  const { getCommunities } = await import("@/sanity/lib/communties/getCommunities");
  const communities = await getCommunities();
  
  const sidebarData: SidebarData = {
    navMain: [
      {
        title: "Community Questions",
        url: "#",
        items: 
        communities?.map((community) => ({
          title: community.title || "",
          url: `/community-questions/${community.slug}`,
          isActive: false,
        })) || [],
      },
    ]
  }

  return <AppSidebarClient sidebarData={sidebarData} />
}

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return <SidebarDataProvider />
}
