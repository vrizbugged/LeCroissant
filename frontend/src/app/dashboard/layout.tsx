"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { AdminHeader } from "@/components/dashboard/admin-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (!token || !userStr) {
        router.push('/login')
        return
      }

      try {
        const user = JSON.parse(userStr)
        const userRole = user.role
        const hasAdminRole = user.roles?.some((r: any) => 
          r.name === 'Admin' || r.name === 'Super Admin'
        )

        if ((userRole !== 'admin' && userRole !== 'super_admin') && !hasAdminRole) {
          router.push('/')
          return
        }
        setIsAuthorized(true)
      } catch (error) {
        console.error(error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (isLoading) return null
  if (!isAuthorized) return null

  return (
    // 1. Provider tetap ada untuk context
    <SidebarProvider defaultOpen={true}>
      
      {/* 2. WRAPPER UTAMA: Flexbox ini yang menjamin mereka berdampingan */}
      <div className="flex h-screen w-full bg-background overflow-hidden">
        
        {/* 3. Sidebar di kiri */}
        <AdminSidebar />
        
        {/* 4. Konten Utama di kanan (flex-1 akan mengisi sisa ruang) */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader />
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </div>
        </main>

      </div>
    </SidebarProvider>
  )
}