"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex-1 min-w-0 w-full">
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0 overflow-x-hidden">
          {/* Container dengan max-width untuk membatasi lebar konten */}
          <div className="mx-auto w-full max-w-7xl">
            <div className="@container/main flex flex-1 flex-col gap-2 w-full min-w-0">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full min-w-0">
                {children}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


