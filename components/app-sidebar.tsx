"use client"

import { useState } from "react"
import { Clock, Braces, ChevronRight, Wrench, Type, Dices, Cpu } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type MenuItem = {
  title: string
  icon: any
  url?: string
  items?: {
    title: string
    url: string
  }[]
}

const items: MenuItem[] = [
  {
    title: "Time",
    icon: Clock,
    items: [
      {
        title: "Timer",
        url: "/time/timer",
      },
      {
        title: "Time Converter",
        url: "/time/converter",
      },
      {
        title: "Cron",
        url: "/time/cron",
      },
    ],
  },
  {
    title: "JSON",
    icon: Braces,
    items: [
      {
        title: "JSON Formatter",
        url: "/json/formatter",
      },
      {
        title: "JSON Converter",
        url: "/json/converter",
      },
    ],
  },
  {
    title: "String",
    icon: Type,
    items: [
      {
        title: "Case",
        url: "/string/case",
      },
      {
        title: "Newline",
        url: "/string/newline",
      },
      {
        title: "Regex",
        url: "/string/regex",
      },
      {
        title: "Manipulator",
        url: "/string/manipulator",
      },
      {
        title: "Extractor",
        url: "/string/extractor",
      },
      {
        title: "Unique",
        url: "/string/unique",
      },
      {
        title: "Set Operations",
        url: "/string/set-operations",
      },
    ],
  },
  {
    title: "Random",
    icon: Dices,
    items: [
      {
        title: "Roulette",
        url: "/random/roulette",
      },
      {
        title: "Lotto",
        url: "/random/lotto",
      },
    ],
  },
  {
    title: "Computer",
    icon: Cpu,
    items: [
      {
        title: "Sort",
        url: "/computer/sort",
      },
      {
        title: "Encoding",
        url: "/computer/encoding",
      },
      {
        title: "Base Converter",
        url: "/computer/base-converter",
      },
      {
        title: "CIDR",
        url: "/computer/cidr",
      },
    ],
  },
]

export function AppSidebar() {
  // State to track which dropdowns are open (default: all open)
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    Time: true,
    JSON: true,
    String: true,
    Random: true,
    Computer: true,
  })

  const toggleDropdown = (title: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <a href="/" className="flex items-center space-x-2 px-2 py-2 hover:bg-accent rounded-lg transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background">
            <Wrench className="h-4 w-4 text-foreground" />
          </div>
          <span className="font-semibold">Tool</span>
        </a>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      open={openDropdowns[item.title]}
                      onOpenChange={() => toggleDropdown(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-300 ease-in-out ${
                            openDropdowns[item.title] ? 'rotate-90' : ''
                          }`} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:max-h-0 data-[state=open]:max-h-[500px]">
                        <SidebarMenuSub className="mt-1 transition-opacity duration-200 ease-in-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 text-xs text-muted-foreground">
          © 2025 Tool
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}