"use client"

import * as React from "react"
import type { ProductResource } from "@/types/api"

export interface CartItem {
  product: ProductResource
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  isAuthenticated: boolean
  addItem: (product: ProductResource, quantity: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

// Helper function to get user ID from localStorage
function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  
  // Check if user is authenticated first
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  if (!token) return null
  
  // Try to get user ID from user data
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      // Try different possible field names for user ID
      return user.id?.toString() || 
             user.user_id?.toString() || 
             user.userId?.toString() ||
             null
    } catch (error) {
      console.error("Error parsing user data:", error)
    }
  }
  
  // If no user data but has token, use token hash as identifier
  // This is a fallback for when user data is not available
  return token ? `user_${token.substring(0, 8)}` : null
}

// Helper function to get cart key for current user
function getCartKey(): string {
  const userId = getUserId()
  // Only save cart if user is authenticated
  return userId ? `cart_${userId}` : 'cart_guest'
}

// Helper function to check if user is authenticated
function checkAuthStatus(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  return !!token
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  // Initialize with current auth status
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return checkAuthStatus()
    }
    return false
  })

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(checkAuthStatus())
    }
    // Check immediately on mount
    checkAuth()
    
    // Listen for auth changes
    const handleStorageChange = () => {
      const wasAuthenticated = checkAuthStatus()
      checkAuth()
      const nowAuthenticated = checkAuthStatus()
      
      // Reload cart when auth changes (user login/logout)
      if (wasAuthenticated !== nowAuthenticated) {
        const cartKey = getCartKey()
        const savedCart = localStorage.getItem(cartKey)
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart))
          } catch (error) {
            console.error("Error loading cart from localStorage:", error)
          }
        } else {
          setItems([])
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authChanged', handleStorageChange)
    
    // Check auth periodically (in case token is removed in same tab)
    const interval = setInterval(checkAuth, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authChanged', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Load cart from localStorage on mount and when user changes
  React.useEffect(() => {
    if (isAuthenticated) {
      const cartKey = getCartKey()
      const savedCart = localStorage.getItem(cartKey)
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("Error loading cart from localStorage:", error)
          setItems([])
        }
      } else {
        setItems([])
      }
    } else {
      // Clear cart display if not authenticated (but don't delete from storage)
      setItems([])
    }
  }, [isAuthenticated])

  // Save cart to localStorage whenever items change (only if authenticated)
  React.useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      const cartKey = getCartKey()
      localStorage.setItem(cartKey, JSON.stringify(items))
    }
    // Dispatch custom event for navbar to update
    window.dispatchEvent(new Event("cartUpdated"))
  }, [items, isAuthenticated])

  const addItem = React.useCallback((product: ProductResource, quantity: number) => {
    // Note: Authentication check should be done before calling this function
    // This function assumes user is already authenticated
    
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id)
      
      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.ketersediaan_stok) {
          alert(`Stok tersedia hanya ${product.ketersediaan_stok} unit`)
          return prevItems
        }
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        // Add new item
        if (quantity > product.ketersediaan_stok) {
          alert(`Stok tersedia hanya ${product.ketersediaan_stok} unit`)
          return prevItems
        }
        return [...prevItems, { product, quantity }]
      }
    })
  }, [])

  const removeItem = React.useCallback((productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }, [])

  const updateQuantity = React.useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    
    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.ketersediaan_stok) {
            alert(`Stok tersedia hanya ${item.product.ketersediaan_stok} unit`)
            return item
          }
          return { ...item, quantity }
        }
        return item
      })
    })
  }, [removeItem])

  const clearCart = React.useCallback(() => {
    setItems([])
  }, [])

  const getTotalItems = React.useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const getTotalPrice = React.useCallback(() => {
    return items.reduce((total, item) => total + (item.product.harga_grosir * item.quantity), 0)
  }, [items])

  const value = React.useMemo(
    () => ({
      items,
      isAuthenticated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
    }),
    [items, isAuthenticated, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

