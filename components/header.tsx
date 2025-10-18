"use client"

import {usePathname} from "next/navigation"
import {SidebarTrigger} from "@/components/ui/sidebar"
import {ThemeToggle} from "@/components/theme-toggle"
import {useSearch} from "@/components/search-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Button} from "@/components/ui/button"
import {Menu, Search} from "lucide-react"
import {Fragment, useEffect, useState} from "react"

export function Header() {
  const pathname = usePathname()
  const { setOpen } = useSearch()
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

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
      <div className="flex h-14 items-center px-4 w-full">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="ml-2">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <div className="h-6 w-px bg-border" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                  {index > 0 && (
                    <BreadcrumbSeparator />
                  )}
                  <BreadcrumbItem className="flex items-center">
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="relative h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline-flex">도구 검색...</span>
            <span className="inline-flex lg:hidden">검색...</span>
            <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">{isMac ? '⌘' : 'Ctrl+'}</span>K
            </kbd>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}