import type { 
  ProductResource, 
  OrderResource, 
  ClientResource, 
  DashboardStats,
  ProductFormData,
  ProductListParams,
  ApiResponse,
  OrderFormData,
  OrderUpdateData,
  OrderStatusUpdate,
  OrderListParams,
  PaginatedApiResponse,
  OrderReportData,
  OrderReportParams,
  UserResource,
  UserFormData,
  UserUpdateData,
  UserStatusUpdate,
  UserListParams,
  ClientFormData,
  ClientUpdateData,
  ClientListParams,
  ClientMarketAnalysisData,
  ClientMarketAnalysisParams,
  AuthResponse,
  AuthLoginData,
  AuthRegisterData,
  ActivityLogResource,
  ActivityLogListParams,
  RoleResource,
  PermissionResource,
  RoleFormData
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
      // Handle 401 Unauthenticated - redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          // Redirect to login page
          window.location.href = '/login'
        }
        return null
      }

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
      // Get orders with pagination and limit
      const response = await ordersApi.getAll({ per_page: limit, page: 1 })
      if (!response) return []
      return response.data || []
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      return []
    }
  },
}

// Auth API
export const authApi = {
  /**
   * Login user
   */
  login: async (data: AuthLoginData): Promise<AuthResponse | null> => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }

      let response: Response
      try {
        response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          cache: 'no-store',
        })
      } catch (fetchError) {
        // Network error (backend tidak berjalan, CORS, dll)
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          throw new Error('Failed to fetch: Tidak dapat terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000')
        }
        throw fetchError
      }

      if (!response.ok) {
        let errorMessage = 'Invalid credentials'
        try {
          const error = await response.json()
          errorMessage = error.message || errorMessage
        } catch {
          // Jika response bukan JSON, gunakan status text
          errorMessage = response.statusText || `HTTP ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      // Validasi response structure
      if (!result.data || !result.data.token) {
        throw new Error('Invalid response format from server')
      }
      
      // Store token in localStorage
      if (typeof window !== 'undefined' && result.data.token) {
        localStorage.setItem('auth_token', result.data.token)
      }
      
      return result.data
    } catch (error) {
      // Re-throw error agar bisa ditangani di component dengan message yang jelas
      throw error
    }
  },

  /**
   * Register new user (Client B2B)
   */
  register: async (data: AuthRegisterData): Promise<AuthResponse | null> => {
    try {
      const response = await apiRequest<ApiResponse<AuthResponse>>('/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!response) return null
      
      // Store token in localStorage
      if (typeof window !== 'undefined' && response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
      }
      
      return response.data
    } catch (error) {
      console.error('Error registering:', error)
      return null
    }
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<boolean> => {
    try {
      const response = await apiRequest('/logout', {
        method: 'POST',
      })
      
      // Remove token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      
      return response !== null
    } catch (error) {
      console.error('Error logging out:', error)
      // Still remove token even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      return false
    }
  },

  /**
   * Get current authenticated user
   */
  me: async (): Promise<UserResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<{ user: UserResource }>>('/user')
      if (!response) return null
      return response.data.user
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  },
}

// Products API
export const productsApi = {
  /**
   * Get all products (supports status filter)
   */
  getAll: async (params?: ProductListParams): Promise<ProductResource[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)

      const queryString = queryParams.toString()
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<ApiResponse<ProductResource[]>>(endpoint)
      if (!response) return []
      return response.data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  },

  /**
   * Get product by ID
   */
  getById: async (id: number): Promise<ProductResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<ProductResource>>(`/products/${id}`)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  },

  /**
   * Create new product (Admin only - requires permission)
   */
  create: async (data: ProductFormData): Promise<ProductResource | null> => {
    try {
      // Handle FormData for file upload
      const formData = new FormData()
      formData.append('nama_produk', data.nama_produk)
      if (data.deskripsi) formData.append('deskripsi', data.deskripsi)
      formData.append('harga_grosir', data.harga_grosir.toString())
      formData.append('ketersediaan_stok', data.ketersediaan_stok.toString())
      if (data.gambar instanceof File) {
        formData.append('gambar', data.gambar)
      } else if (data.gambar && typeof data.gambar === 'string') {
        formData.append('gambar', data.gambar)
      }
      // Status is required by backend, always send it
      formData.append('status', data.status || 'Aktif')

      const token = typeof window !== 'undefined' ? getAuthToken() : null
      const headers: HeadersInit = {
        'Accept': 'application/json',
        // Don't set Content-Type for FormData - browser will set it automatically with boundary
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers,
        body: formData,
      }).catch((error) => {
        console.error('Network error:', error)
        throw new Error('Failed to connect to server. Please check your connection.')
      })

      if (!response) {
        throw new Error('Failed to connect to server')
      }

      if (!response.ok) {
        // Handle 401 Unauthenticated - redirect to login
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
          }
          return null
        }

        const error = await response.json().catch(() => ({ 
          message: `Request failed: ${response.statusText}` 
        }))
        throw new Error(error.message || `Request failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || null
    } catch (error) {
      console.error('Error creating product:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  },

  /**
   * Update product (Admin only - requires permission)
   * FIX: Menggunakan POST + _method: 'PUT' agar file gambar terbaca oleh Laravel
   */
  update: async (id: number, data: Partial<ProductFormData>): Promise<ProductResource | null> => {
    try {
      // Handle FormData for file upload
      const formData = new FormData()

      // --- FIX: Tambahkan _method PUT ---
      formData.append('_method', 'PUT')
      // ----------------------------------

      // Always send required fields
      if (data.nama_produk) formData.append('nama_produk', data.nama_produk)
      if (data.deskripsi !== undefined) formData.append('deskripsi', data.deskripsi || '')
      if (data.harga_grosir !== undefined) formData.append('harga_grosir', data.harga_grosir.toString())
      if (data.ketersediaan_stok !== undefined) formData.append('ketersediaan_stok', data.ketersediaan_stok.toString())
      
      // Handle gambar upload
      if (data.gambar instanceof File) {
        formData.append('gambar', data.gambar)
      } else if (data.gambar && typeof data.gambar === 'string' && data.gambar.trim() !== '') {
        // formData.append('gambar', data.gambar) // Optional: biasanya tidak perlu kirim string URL balik
      }
      // Status is required by backend, always send it
      if (data.status) formData.append('status', data.status)

      const token = typeof window !== 'undefined' ? getAuthToken() : null
      const headers: HeadersInit = {
        'Accept': 'application/json',
        // Don't set Content-Type for FormData - browser will set it automatically with boundary
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'POST', // --- FIX: Ubah dari PUT ke POST ---
        headers,
        body: formData,
      }).catch((error) => {
        console.error('Network error:', error)
        throw new Error('Failed to connect to server. Please check your connection.')
      })

      if (!response) {
        throw new Error('Failed to connect to server')
      }

      if (!response.ok) {
        // Handle 401 Unauthenticated - redirect to login
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
          }
          return null
        }

        const error = await response.json().catch(() => ({ 
          message: `Request failed: ${response.statusText}` 
        }))
        throw new Error(error.message || `Request failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || null
    } catch (error) {
      console.error('Error updating product:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  },

  /**
   * Delete product (Admin only - requires permission)
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await apiRequest(`/products/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  },
}

// Orders API
export const ordersApi = {
  /**
   * Get all orders (Admin only - requires permission)
   * Supports filtering by status, user_id, and pagination
   */
  getAll: async (params?: OrderListParams): Promise<PaginatedApiResponse<OrderResource> | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString())
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params?.page) queryParams.append('page', params.page.toString())

      const queryString = queryParams.toString()
      const endpoint = `/orders${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<PaginatedApiResponse<OrderResource>>(endpoint)
      if (!response) return null
      return response
    } catch (error) {
      console.error('Error fetching orders:', error)
      return null
    }
  },

  /**
   * Get current user's orders (Client)
   */
  getMyOrders: async (params?: { per_page?: number; page?: number }): Promise<PaginatedApiResponse<OrderResource> | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params?.page) queryParams.append('page', params.page.toString())

      const queryString = queryParams.toString()
      const endpoint = `/my-orders${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<PaginatedApiResponse<OrderResource>>(endpoint)
      if (!response) return null
      return response
    } catch (error) {
      console.error('Error fetching my orders:', error)
      return null
    }
  },

  /**
   * Get order by ID (Admin only - requires permission)
   */
  getById: async (id: number): Promise<OrderResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<OrderResource>>(`/orders/${id}`)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  },

  /**
   * Create new order (Client)
   */
  create: async (data: OrderFormData): Promise<OrderResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<OrderResource>>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  },

  /**
   * Update order (Admin only - requires permission)
   */
  update: async (id: number, data: OrderUpdateData): Promise<OrderResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<OrderResource>>(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error updating order:', error)
      return null
    }
  },

  /**
   * Delete order (Admin only - requires permission)
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await apiRequest(`/orders/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  },

  /**
   * Update order status (Admin only - requires permission)
   * Shortcut endpoint for updating only the status
   */
  updateStatus: async (id: number, status: OrderStatusUpdate['status']): Promise<OrderResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<OrderResource>>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error updating order status:', error)
      return null
    }
  },

  /**
   * Get order report (Admin only - requires permission)
   * Returns summary and orders within date range
   */
  getReport: async (params?: OrderReportParams): Promise<OrderReportData | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)

      const queryString = queryParams.toString()
      const endpoint = `/orders-report${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<ApiResponse<OrderReportData>>(endpoint)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching order report:', error)
      return null
    }
  },
}

// Users API
export const usersApi = {
  /**
   * Get all users (Admin only - requires permission)
   * Supports search and pagination
   */
  getAll: async (params?: UserListParams): Promise<PaginatedApiResponse<UserResource> | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.search) queryParams.append('search', params.search)
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params?.page) queryParams.append('page', params.page.toString())

      const queryString = queryParams.toString()
      const endpoint = `/users${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<PaginatedApiResponse<UserResource>>(endpoint)
      if (!response) return null
      return response
    } catch (error) {
      console.error('Error fetching users:', error)
      return null
    }
  },

  /**
   * Get user by ID (Admin only - requires permission)
   */
  getById: async (id: number): Promise<UserResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<UserResource>>(`/users/${id}`)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  },

  /**
   * Create new user (Admin only - requires permission)
   */
  create: async (data: UserFormData): Promise<UserResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<UserResource>>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  },

  /**
   * Update user (Admin only - requires permission)
   */
  update: async (id: number, data: UserUpdateData): Promise<UserResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<UserResource>>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  },

  /**
   * Delete user (Admin only - requires permission)
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await apiRequest(`/users/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  },

  /**
   * Update user status (Admin only - requires permission)
   */
  updateStatus: async (id: number, status: UserStatusUpdate['status']): Promise<UserResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<UserResource>>(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error updating user status:', error)
      return null
    }
  },
}

// Clients API
export const clientsApi = {
  /**
   * Get all clients (Admin & Sales - requires permission)
   * Supports filtering by sector and citizenship
   */
  getAll: async (params?: ClientListParams): Promise<ClientResource[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.sector) queryParams.append('sector', params.sector)
      if (params?.citizenship) queryParams.append('citizenship', params.citizenship)

      const queryString = queryParams.toString()
      const endpoint = `/clients${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<ApiResponse<ClientResource[]>>(endpoint)
      if (!response) return []
      return response.data || []
    } catch (error) {
      console.error('Error fetching clients:', error)
      return []
    }
  },

  /**
   * Get client by ID (Admin & Sales - requires permission)
   */
  getById: async (id: number): Promise<ClientResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<ClientResource>>(`/clients/${id}`)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching client:', error)
      return null
    }
  },

  /**
   * Create new client (Admin & Sales - requires permission)
   */
  create: async (data: ClientFormData): Promise<ClientResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<ClientResource>>('/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error creating client:', error)
      return null
    }
  },

  /**
   * Update client (Admin & Sales - requires permission)
   */
  update: async (id: number, data: ClientUpdateData): Promise<ClientResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<ClientResource>>(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error updating client:', error)
      return null
    }
  },

  /**
   * Delete client (Admin & Sales - requires permission)
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await apiRequest(`/clients/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    } catch (error) {
      console.error('Error deleting client:', error)
      return false
    }
  },

  /**
   * Verify client account (Admin & Sales - requires permission)
   * Changes status from Pending to Aktif
   */
  verify: async (id: number): Promise<ClientResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<ClientResource>>(`/clients/${id}/verify`, {
        method: 'PATCH',
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error verifying client:', error)
      return null
    }
  },

  /**
   * Get market analysis report (Admin & Sales - requires permission)
   */
  getMarketAnalysis: async (params?: ClientMarketAnalysisParams): Promise<ClientMarketAnalysisData | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)

      const queryString = queryParams.toString()
      const endpoint = `/clients-market-analysis${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<ApiResponse<ClientMarketAnalysisData>>(endpoint)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching market analysis:', error)
      return null
    }
  },
}

// Activity Logs API
export const activityLogsApi = {
  /**
   * Get paginated activity logs (requires permission: melihat activity log)
   */
  getLogs: async (params?: ActivityLogListParams): Promise<PaginatedApiResponse<ActivityLogResource> | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.causer_id) queryParams.append('causer_id', params.causer_id.toString())
      if (params?.subject_type) queryParams.append('subject_type', params.subject_type)
      if (params?.subject_id) queryParams.append('subject_id', params.subject_id.toString())
      if (params?.event) queryParams.append('event', params.event)
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.search) queryParams.append('search', params.search)

      const queryString = queryParams.toString()
      const endpoint = `/activity-logs${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<{
        success: boolean
        data: ActivityLogResource[]
        meta: {
          current_page: number
          per_page: number
          total: number
          last_page: number
        }
      }>(endpoint)
      
      if (!response) return null
      
      return {
        data: response.data,
        meta: response.meta,
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      return null
    }
  },

  /**
   * Export activity logs (requires permission: mengekspor activity log)
   */
  export: async (params?: ActivityLogListParams): Promise<ActivityLogResource[] | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.causer_id) queryParams.append('causer_id', params.causer_id.toString())
      if (params?.subject_type) queryParams.append('subject_type', params.subject_type)
      if (params?.subject_id) queryParams.append('subject_id', params.subject_id.toString())
      if (params?.event) queryParams.append('event', params.event)
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.search) queryParams.append('search', params.search)

      const queryString = queryParams.toString()
      const endpoint = `/activity-logs/export${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<ApiResponse<ActivityLogResource[]>>(endpoint)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error exporting activity logs:', error)
      return null
    }
  },
}

// Roles API
export const rolesApi = {
  /**
   * Get all roles (requires permission: mengelola roles)
   */
  getAll: async (): Promise<RoleResource[] | null> => {
    try {
      const response = await apiRequest<ApiResponse<RoleResource[]>>('/roles')
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching roles:', error)
      return null
    }
  },

  /**
   * Get role by ID (requires permission: mengelola roles)
   */
  getById: async (id: number): Promise<RoleResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<RoleResource>>(`/roles/${id}`)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching role:', error)
      return null
    }
  },

  /**
   * Create new role (requires permission: mengelola roles)
   */
  create: async (data: RoleFormData): Promise<RoleResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<RoleResource>>('/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error creating role:', error)
      return null
    }
  },

  /**
   * Update role (requires permission: mengelola roles)
   */
  update: async (id: number, data: Partial<RoleFormData>): Promise<RoleResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<RoleResource>>(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error updating role:', error)
      return null
    }
  },

  /**
   * Delete role (requires permission: mengelola roles)
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await apiRequest<ApiResponse<void>>(`/roles/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    } catch (error) {
      console.error('Error deleting role:', error)
      return false
    }
  },

  /**
   * Add permission to role (requires permission: mengelola roles)
   */
  addPermission: async (id: number, permissionId: number): Promise<RoleResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<RoleResource>>(`/roles/${id}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ permission_id: permissionId }),
      })
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error adding permission to role:', error)
      return null
    }
  },
}

// Permissions API
export const permissionsApi = {
  /**
   * Get all permissions (requires permission: mengelola roles)
   */
  getAll: async (params?: { search?: string }): Promise<PermissionResource[] | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.search) queryParams.append('search', params.search)

      const queryString = queryParams.toString()
      const endpoint = `/permissions${queryString ? `?${queryString}` : ''}`
      
      const response = await apiRequest<ApiResponse<PermissionResource[]>>(endpoint)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return null
    }
  },

  /**
   * Get permission by ID (requires permission: mengelola roles)
   */
  getById: async (id: number): Promise<PermissionResource | null> => {
    try {
      const response = await apiRequest<ApiResponse<PermissionResource>>(`/permissions/${id}`)
      if (!response) return null
      return response.data
    } catch (error) {
      console.error('Error fetching permission:', error)
      return null
    }
  },
}