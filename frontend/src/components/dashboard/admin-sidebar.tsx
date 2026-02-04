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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { ordersApi } from "@/lib/api"
import type { OrderResource } from "@/types/api"
import { ClearActivityLogs } from "@/components/dashboard/clear-activity-logs"

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
    title: "Product Management",
    url: "/dashboard/products",
    icon: PackageIcon,
  },
  {
    title: "Order Management",
    url: "/dashboard/orders",
    icon: ShoppingCartIcon,
  },
]

// Client Management (separate group)
const clientManagementItems = [
  {
    title: "Client Management",
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
]

// Role & Permission (separate group for Super Admin)
const rolePermissionItems = [
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
  const [newOrdersCount, setNewOrdersCount] = React.useState(0)

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

  // Check for new orders (created within last 24 hours and not viewed)
  const checkNewOrders = React.useCallback(async () => {
    try {
      const response = await ordersApi.getAll()
      if (response && response.data) {
        const now = new Date()
        const viewedOrders = JSON.parse(localStorage.getItem('viewed_orders') || '[]')
        const newOrders = response.data.filter((order: OrderResource) => {
          if (!order.created_at) return false
          // Skip if already viewed
          if (viewedOrders.includes(order.id)) return false
          const orderDate = new Date(order.created_at)
          const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)
          return diffInHours <= 24
        })
        setNewOrdersCount(newOrders.length)
      }
    } catch (error) {
      console.error('Error checking new orders:', error)
    }
  }, [])

  React.useEffect(() => {
    checkNewOrders()
    // Check every 30 seconds
    const interval = setInterval(checkNewOrders, 30000)
    
    // Listen for custom event when orders are viewed
    const handleOrdersViewed = () => {
      checkNewOrders()
    }
    window.addEventListener('ordersViewed', handleOrdersViewed)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('ordersViewed', handleOrdersViewed)
    }
  }, [checkNewOrders])

  // Combine nav items based on role
  const mainNavItems = React.useMemo(() => {
    // Add notification badge to Order Management
    return baseNavItems.map(item => {
      if (item.url === '/dashboard/orders') {
        return { ...item, badge: newOrdersCount > 0 ? newOrdersCount : undefined }
      }
      return item
    })
  }, [newOrdersCount])

  const adminNavItems = React.useMemo(() => {
    return isSuperAdmin ? superAdminNavItems : []
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
        {/* Main Navigation */}
        <NavMain items={mainNavItems.map(item => ({
          ...item,
          isActive: pathname === item.url || pathname?.startsWith(item.url + '/'),
        }))} />

        {/* Client Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Client Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clientManagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url || pathname?.startsWith(item.url + '/')}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Super Admin Navigation */}
        {isSuperAdmin && adminNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url || pathname?.startsWith(item.url + '/')}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Role & Permission Group (Super Admin only) */}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Access Control</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {rolePermissionItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url || pathname?.startsWith(item.url + '/')}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.name || "Admin",
          email: user?.email || "admin@lecroissant.com",
          avatar: "/avatars/admin.jpg",
        }} />
      </SidebarFooter>
      <SidebarRail />
      {/* Hidden feature: Clear Activity Logs (Super Admin only) */}
      <ClearActivityLogs isSuperAdmin={isSuperAdmin} />
    </Sidebar>
  )
}
