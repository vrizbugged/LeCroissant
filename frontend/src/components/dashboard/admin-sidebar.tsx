"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  FileTextIcon,
  BarChart3Icon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"

// Dynamic import NavUser to prevent hydration mismatch with Radix UI DropdownMenu
const NavUser = dynamic(
  () => import("@/components/nav-user").then((mod) => ({ default: mod.NavUser })),
  {
    ssr: false,
  }
)

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Manajemen Produk",
    url: "/dashboard/products",
    icon: PackageIcon,
  },
  {
    title: "Manajemen Pesanan",
    url: "/dashboard/orders",
    icon: ShoppingCartIcon,
  },
  {
    title: "Data Klien",
    url: "/dashboard/clients",
    icon: UsersIcon,
  },
  {
    title: "Kelola Konten",
    url: "/dashboard/content",
    icon: FileTextIcon,
  },
  {
    title: "Laporan",
    url: "/dashboard/reports",
    icon: BarChart3Icon,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5 flex-1"
              >
                <Link href="/dashboard">
                  <span className="text-base font-semibold">Le Croissant</span>
                </Link>
              </SidebarMenuButton>
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden h-7 w-7 mr-2" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems.map(item => ({
          ...item,
          isActive: pathname === item.url || pathname?.startsWith(item.url + '/'),
        }))} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: "Admin",
          email: "admin@lecroissant.com",
          avatar: "/avatars/admin.jpg",
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
