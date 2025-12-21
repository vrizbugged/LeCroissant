import type { 
  ProductResource, 
  OrderResource, 
  ClientResource, 
  DashboardStats,
  ProductFormData,
  ApiResponse 
} from "@/types/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

// Get auth token (client-side only)
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

// Generic API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const token = typeof window !== 'undefined' ? getAuthToken() : null
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    }).catch(() => {
      // Handle network errors (API not available, connection refused, etc.)
      return null
    })

    // If fetch failed (network error), return null
    if (!response) {
      return null
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }))
      throw new Error(error.message || `Request failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    // Only throw for non-network errors
    if (error instanceof Error && !error.message.includes('Network')) {
      throw error
    }
    // Return null for network errors
    return null
  }
}

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats | null> => {
    try {
      const response = await apiRequest<ApiResponse<DashboardStats>>('/dashboard/stats')
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return null
    }
  },

  getRecentOrders: async (limit: number = 5): Promise<OrderResource[]> => {
    try {
      const response = await apiRequest<ApiResponse<OrderResource[]>>(`/orders?limit=${limit}`)
      if (!response) return []
      return response.data || []
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      return []
    }
  },
}

// Products API
export const productsApi = {
  getAll: async (): Promise<ProductResource[]> => {
    try {
      const response = await apiRequest<ApiResponse<ProductResource[]>>('/products')
      if (!response) return []
      return response.data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  },

  getById: async (id: number): Promise<ProductResource | null> => {
    const response = await apiRequest<ApiResponse<ProductResource>>(`/products/${id}`)
    if (!response) return null
    return response.data
  },

  create: async (data: ProductFormData): Promise<ProductResource | null> => {
    const response = await apiRequest<ApiResponse<ProductResource>>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response) return null
    return response.data
  },

  update: async (id: number, data: Partial<ProductFormData>): Promise<ProductResource | null> => {
    const response = await apiRequest<ApiResponse<ProductResource>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (!response) return null
    return response.data
  },

  delete: async (id: number): Promise<boolean> => {
    const response = await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    })
    return response !== null
  },
}

// Orders API
export const ordersApi = {
  getAll: async (): Promise<OrderResource[]> => {
    try {
      const response = await apiRequest<ApiResponse<OrderResource[]>>('/orders')
      if (!response) return []
      return response.data || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  getById: async (id: number): Promise<OrderResource | null> => {
    const response = await apiRequest<ApiResponse<OrderResource>>(`/orders/${id}`)
    if (!response) return null
    return response.data
  },

  updateStatus: async (id: number, status: OrderResource['status']): Promise<OrderResource | null> => {
    const response = await apiRequest<ApiResponse<OrderResource>>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
    if (!response) return null
    return response.data
  },
}

// Clients API
export const clientsApi = {
  getAll: async (): Promise<ClientResource[]> => {
    try {
      const response = await apiRequest<ApiResponse<ClientResource[]>>('/clients')
      if (!response) return []
      return response.data || []
    } catch (error) {
      console.error('Error fetching clients:', error)
      return []
    }
  },
}
