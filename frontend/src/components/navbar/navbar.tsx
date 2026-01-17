"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, LogIn, ShoppingCartIcon, ShoppingBasket, House, User, Receipt, UserPlus, Bell } from "lucide-react"
import { authApi, ordersApi } from "@/lib/api"
import type { UserResource, OrderResource } from "@/types/api"

export function Navbar() {
  const router = useRouter()
  // State untuk menyimpan status login
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [cartItemCount, setCartItemCount] = React.useState(0)
  const [userData, setUserData] = React.useState<UserResource | null>(null)
  const [hasNewOrderUpdate, setHasNewOrderUpdate] = React.useState(false)
  const [latestOrderStatus, setLatestOrderStatus] = React.useState<OrderResource['status'] | null>(null)

  // Get cart items count based on user authentication
  const getCartCount = () => {
    if (!isLoggedIn) {
      return 0
    }
    
    try {
      // Get user ID to find the correct cart
      const userStr = localStorage.getItem('user')
      let userId = null
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          userId = user.id?.toString() || user.user_id?.toString() || user.userId?.toString()
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
      
      // If no user ID, try to get from token
      if (!userId) {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
        if (token) {
          userId = `user_${token.substring(0, 8)}`
        }
      }
      
      if (!userId) return 0
      
      const cartKey = `cart_${userId}`
      const savedCart = localStorage.getItem(cartKey)
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        // Return jumlah produk yang berbeda, bukan total quantity
        return cart.length || 0
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    }
    return 0
  }

  // Update cart count when login status or cart changes
  React.useEffect(() => {
    const updateCartCount = () => {
      setCartItemCount(getCartCount())
    }
    updateCartCount()
    
    const handleStorageChange = () => {
      updateCartCount()
    }

    window.addEventListener("storage", handleStorageChange)
    // Also listen for custom event for same-tab updates
    window.addEventListener("cartUpdated", handleStorageChange)
    window.addEventListener("authChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("cartUpdated", handleStorageChange)
      window.removeEventListener("authChanged", handleStorageChange)
    }
  }, [isLoggedIn])

  // Fetch user data when logged in
  React.useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token")
      if (token) {
        try {
          const user = await authApi.me()
          if (user) {
            setUserData(user)
            setIsLoggedIn(true)
          } else {
            setUserData(null)
            setIsLoggedIn(false)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUserData(null)
          setIsLoggedIn(false)
        }
      } else {
        setUserData(null)
        setIsLoggedIn(false)
      }
    }
    
    fetchUserData()
    
    // Listen for auth changes
    const handleAuthChange = () => {
      fetchUserData()
    }
    
    window.addEventListener("authChanged", handleAuthChange)
    window.addEventListener("storage", handleAuthChange)
    
    return () => {
      window.removeEventListener("authChanged", handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [])

  // Check for order status updates
  React.useEffect(() => {
    const checkOrderUpdates = async () => {
      if (!isLoggedIn) {
        setHasNewOrderUpdate(false)
        setLatestOrderStatus(null)
        return
      }

      try {
        const response = await ordersApi.getMyOrders({ per_page: 1 })
        if (response && response.data && response.data.length > 0) {
          const latestOrder = response.data[0]
          const storedStatus = localStorage.getItem('lastOrderStatus')
          
          if (storedStatus && storedStatus !== latestOrder.status) {
            setHasNewOrderUpdate(true)
            // Dispatch event untuk landing page
            window.dispatchEvent(new CustomEvent('orderStatusUpdated', { 
              detail: { order: latestOrder } 
            }))
          }
          
          setLatestOrderStatus(latestOrder.status)
          localStorage.setItem('lastOrderStatus', latestOrder.status)
        }
      } catch (error) {
        console.error("Error checking order updates:", error)
      }
    }

    // Check immediately
    checkOrderUpdates()

    // Poll every 30 seconds
    const interval = setInterval(checkOrderUpdates, 30000)

    return () => clearInterval(interval)
  }, [isLoggedIn])

  // Clear notification when user clicks
  const handleUserMenuClick = () => {
    setHasNewOrderUpdate(false)
  }

  // Efek ini jalan otomatis saat halaman dimuat
  React.useEffect(() => {
    const checkAuth = () => {
      // Cek apakah ada token di penyimpanan browser
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token")
      setIsLoggedIn(!!token)
      setCartItemCount(getCartCount())
    }
    
    checkAuth()
    
    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth()
    }
    
    window.addEventListener("authChanged", handleAuthChange)
    window.addEventListener("storage", handleAuthChange)
    
    return () => {
      window.removeEventListener("authChanged", handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [])

  // Fungsi saat tombol Logout diklik
  const handleLogout = () => {
    localStorage.removeItem("token") // Hapus token
    localStorage.removeItem("auth_token") // Hapus auth_token juga
    localStorage.removeItem("user")  // Hapus data user (opsional)
    setIsLoggedIn(false)             // Update tampilan jadi "belum login"
    setUserData(null)                // Clear user data
    
    // Dispatch event untuk cart context agar cart di-reload
    window.dispatchEvent(new Event("authChanged"))
    
    router.push("/login")            // Pindah ke halaman login
    router.refresh()                 // Refresh halaman agar data bersih
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/50 border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* --- BAGIAN KIRI: Logo & Menu --- */}
          <div className="flex items-center gap-4 md:gap-6 pl-4 md:pl-6">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative w-20 h-20 md:w-40 md:h-40">
                <Image
                  src="/image/lecroissant.png"
                  alt="Brand Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Menu Navigasi (Hanya di Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" className="text-sm font-medium text-black hover:text-black/90 hover:bg-black/20">
                <House className="h-4 w-4 mr-1" />  
                  Home
                </Button>
              </Link>
              <span className="text-black/70 mx-1">·</span>
              <Link href="/shop">
                <Button variant="ghost" className="text-sm font-medium text-black hover:text-black/90 hover:bg-black/20">
                <ShoppingBasket className="h-4 w-4 mr-1" />
                  Shop
                </Button>
              </Link>
            </div>
          </div>

          {/* --- BAGIAN KANAN: Cart & User Dropdown --- */}
          <div className="flex items-center gap-2 pr-4 md:pr-6">
            {/* Cart Icon */}
            <Link href="/cart">
              <Button
                variant="outline"
                size="sm"
                className="text-sm bg-white border-white/30 text-orange-600 hover:bg-white/90 hover:text-orange-700 shadow-sm relative"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                {isLoggedIn && cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-600 text-white border-none">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm bg-white border-white/30 text-orange-600 hover:bg-white/90 hover:text-orange-700 shadow-sm gap-2 relative"
                  onClick={handleUserMenuClick}
                >
                  <User className="h-4 w-4" />
                  {isLoggedIn && userData?.name && (
                    <span className="hidden sm:inline-block max-w-[120px] truncate">
                      {userData.name}
                    </span>
                  )}
                  {hasNewOrderUpdate && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isLoggedIn ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/my-transactions" className="flex items-center cursor-pointer">
                        <Receipt className="mr-2 h-4 w-4" />
                        My Transactions
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center cursor-pointer">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/signup" className="flex items-center cursor-pointer">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
        </div>
      </div>
    </nav>
  )
}