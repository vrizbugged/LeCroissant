// API Types matching Laravel Resource responses

// Product Resource (matching ProductResource from backend)
export interface ProductResource {
  id: number
  nama_produk: string
  deskripsi?: string | null
  harga_grosir: number
  harga_formatted?: string // Formatted price from backend
  ketersediaan_stok: number
  gambar_url?: string | null
  status?: string // Aktif or Non Aktif
  created_at?: string | null
  updated_at?: string | null
}

// Product Form Data (for creating/updating products)
export interface ProductFormData {
  nama_produk: string
  deskripsi?: string
  harga_grosir: number
  ketersediaan_stok: number
  gambar?: File | string // File for upload or string for existing image
  status?: string
}

// Product List Query Parameters
export interface ProductListParams {
  status?: string // Filter by status (Aktif/Non Aktif)
}

// Order Resource (matching Laravel Order model)
export interface OrderResource {
  id: number
  user_id: number
  delivery_date: string
  status: 'menunggu_konfirmasi' | 'diproses' | 'selesai' | 'dibatalkan'
  total_price: number
  special_notes?: string | null
  created_at: string
  updated_at: string
  // Relationships
  user?: UserResource
  products?: OrderProductResource[]
  invoice?: InvoiceResource | null
}

// Order Product (from pivot table)
export interface OrderProductResource {
  id: number
  name: string
  description?: string
  price_b2b: number
  stock: number
  image_url?: string
  pivot: {
    quantity: number
    price_at_purchase: number
  }
}

// User Resource (matching User model from backend)
export interface UserResource {
  id: number
  name: string
  email: string
  phone_number?: string | null
  address?: string | null
  role?: 'admin' | 'klien_b2b' | null
  status?: 'Aktif' | 'Non Aktif'
  created_at?: string
  updated_at?: string
}

// User Form Data
export interface UserFormData {
  name: string
  email: string
  password: string
  password_confirmation?: string
  phone_number?: string
  address?: string
  role?: 'admin' | 'klien_b2b'
  status?: 'Aktif' | 'Non Aktif'
}

// User Update Data
export interface UserUpdateData {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
  phone_number?: string | null
  address?: string | null
  role?: 'admin' | 'klien_b2b'
  status?: 'Aktif' | 'Non Aktif'
}

// User Status Update
export interface UserStatusUpdate {
  status: 'Aktif' | 'Non Aktif'
}

// User List Query Parameters
export interface UserListParams {
  search?: string
  per_page?: number
  page?: number
}

// Invoice Resource
export interface InvoiceResource {
  id: number
  order_id: number
  invoice_number: string
  total_amount: number
  status: string
  created_at: string
}

// Order Form Data (for creating/updating orders)
export interface OrderFormData {
  delivery_date: string
  special_notes?: string
  products: Array<{
    id: number
    quantity: number
  }>
}

// Order Update Data
export interface OrderUpdateData {
  delivery_date?: string
  special_notes?: string | null
  status?: 'menunggu_konfirmasi' | 'diproses' | 'selesai' | 'dibatalkan'
}

// Order Status Update
export interface OrderStatusUpdate {
  status: 'menunggu_konfirmasi' | 'diproses' | 'selesai' | 'dibatalkan'
}

// Order List Query Parameters
export interface OrderListParams {
  status?: 'menunggu_konfirmasi' | 'diproses' | 'selesai' | 'dibatalkan'
  user_id?: number
  per_page?: number
  page?: number
}

// Pagination Meta
export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

// Paginated API Response
export interface PaginatedApiResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
}

// Order Report Data
export interface OrderReportData {
  period: {
    start_date: string
    end_date: string
  }
  summary: {
    total_orders: number
    completed_orders: number
    total_revenue: number
  }
  orders: OrderResource[]
}

// Order Report Query Parameters
export interface OrderReportParams {
  start_date?: string
  end_date?: string
}

// Client Resource (matching ClientResource from backend)
export interface ClientResource {
  id: number
  name: string
  email: string
  phone_number?: string | null
  company_name?: string | null
  business_sector?: string | null
  citizenship?: string | null
  address?: string | null
  status?: string // Pending, Aktif, Non Aktif
  total_orders_count?: number
  created_at?: string | null
  updated_at?: string | null
}

// Client Form Data
export interface ClientFormData {
  name: string
  email: string
  phone_number?: string
  company_name?: string
  business_sector?: string
  citizenship?: string
  address?: string
  status?: string
}

// Client Update Data
export interface ClientUpdateData {
  name?: string
  email?: string
  phone_number?: string | null
  company_name?: string | null
  business_sector?: string | null
  citizenship?: string | null
  address?: string | null
  status?: string
}

// Client List Query Parameters
export interface ClientListParams {
  sector?: string
  citizenship?: string
}

// Client Market Analysis Data
export interface ClientMarketAnalysisData {
  period: {
    start_date: string
    end_date: string
  }
  segments: Array<{
    sector?: string
    citizenship?: string
    total_clients: number
    total_orders: number
    total_revenue: number
  }>
}

// Client Market Analysis Query Parameters
export interface ClientMarketAnalysisParams {
  start_date?: string
  end_date?: string
}

// Dashboard Stats
export interface DashboardStats {
  total_pendapatan: number
  pesanan_pending: number
  produk_aktif: number
  total_klien_b2b: number
}

// Auth Response
export interface AuthResponse {
  user: UserResource
  token: string
  token_type: 'Bearer'
}

// Auth Login Data
export interface AuthLoginData {
  email: string
  password: string
}

// Auth Register Data
export interface AuthRegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

// Legacy OrderItemResource (kept for backward compatibility if needed)
export interface OrderItemResource {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  subtotal: number
}


