"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Menu, Slash } from "lucide-react"
import Link from "next/link";

export function Header() {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)

    if (segments.length === 0) {
      return [{ label: "Home", href: "/", isLast: true }]
    }

    const breadcrumbs = [{ label: "Home", href: "/", isLast: false }]

    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const isLast = index === segments.length - 1
      const label = segment.charAt(0).toUpperCase() + segment.slice(1)

      breadcrumbs.push({ label, href, isLast })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="ml-2">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>

          <div className="h-6 w-px bg-border" />

          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <>
                  {index > 0 && (
                    <BreadcrumbSeparator />
                  )}
                  <BreadcrumbItem key={crumb.href} className="flex items-center">
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink>
                        <Link href={crumb.href}>
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}