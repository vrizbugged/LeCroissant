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
  LogOutIcon,
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

const NavUser = dynamic(
  () => import("@/components/nav-user").then((mod) => ({ default: mod.NavUser })),
  { ssr: false }
)

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Manajemen Produk", url: "/dashboard/products", icon: PackageIcon },
  { title: "Manajemen Pesanan", url: "/dashboard/orders", icon: ShoppingCartIcon },
  { title: "Data Klien", url: "/dashboard/clients", icon: UsersIcon },
  { title: "Kelola Konten", url: "/dashboard/content", icon: FileTextIcon },
  { title: "Laporan", url: "/dashboard/reports", icon: BarChart3Icon },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    // PERBAIKAN PENTING DI SINI:
    // 1. !relative: Paksa masuk flow dokumen (jangan floating)
    // 2. h-screen: Tinggi penuh
    // 3. !border-r: Batas kanan
    // 4. class w-... dihandle otomatis oleh komponen Sidebar, tapi kita tambah style width manual jika perlu
    <Sidebar 
      collapsible="icon" 
      className="h-full border-r bg-sidebar z-10"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full px-2 py-2">
              <SidebarMenuButton asChild size="lg" className="flex-1">
                <Link href="/dashboard" className="flex items-center gap-2">
                   {/* Logo / Brand Name */}
                  <span className="text-base font-bold truncate">Le Croissant</span>
                </Link>
              </SidebarMenuButton>
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