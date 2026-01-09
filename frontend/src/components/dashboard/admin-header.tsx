"use client"

import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { authApi } from "@/lib/api"
import { toast } from "sonner"

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Logika sederhana untuk menampilkan nama halaman di breadcrumb
  const currentPath = pathname.split('/').pop() || 'Dashboard'
  const formattedPath = currentPath.charAt(0).toUpperCase() + currentPath.slice(1)

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API
      await authApi.logout()
      
      // Clear localStorage
      localStorage.removeItem("token")
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
      
      // Dispatch event untuk update UI
      window.dispatchEvent(new Event("authChanged"))
      
      // Redirect to login
      router.push("/login")
      router.refresh()
      
      toast.success("Logout berhasil")
    } catch (error) {
      console.error("Error logging out:", error)
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem("token")
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
      window.dispatchEvent(new Event("authChanged"))
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
      {/* INI TOMBOL PENTING: Untuk buka/tutup sidebar */}
      <SidebarTrigger className="-ml-1" />
      
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {formattedPath !== 'Dashboard' && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{formattedPath}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Logout Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="ml-auto"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  )
}