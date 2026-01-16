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
  ActivityIcon,
  ShieldCheckIcon,
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

// Base navigation items for all admins
const baseNavItems = [
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

]

// Super Admin only navigation items
const superAdminNavItems = [
  {
    title: "Activity Log",
    url: "/dashboard/activity-logs",
    icon: ActivityIcon,
  },
  {
    title: "Role & Permission",
    url: "/dashboard/roles",
    icon: ShieldCheckIcon,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false)

  // Get user from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          setUser(userData)
          
          // Check if user is super admin (menggunakan Spatie Permission roles)
          const isSuper = userData.roles && userData.roles.some((r: any) => r.name === 'Super Admin')
          setIsSuperAdmin(isSuper)
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }
  }, [])

  // Combine nav items based on role
  const navItems = React.useMemo(() => {
    if (isSuperAdmin) {
      return [...baseNavItems, ...superAdminNavItems]
    }
    return baseNavItems
  }, [isSuperAdmin])

  return (
    <Sidebar 
      collapsible="icon" 
      className="!relative h-screen !border-r bg-sidebar z-10"
    >
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
          name: user?.name || "Admin",
          email: user?.email || "admin@lecroissant.com",
          avatar: "/avatars/admin.jpg",
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
