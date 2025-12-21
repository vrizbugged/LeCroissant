// API Types matching Laravel Resource responses

// Product Resource
export interface ProductResource {
  id_produk: number
  nama_produk: string
  harga_grosir: number
  ketersediaan_stok: number
  gambar: string
  deskripsi: string
  created_at?: string
  updated_at?: string
}

// Product Form Data
export interface ProductFormData {
  nama_produk: string
  deskripsi: string
  harga_grosir: number
  ketersediaan_stok: number
  gambar: string
}

// Order Resource
export interface OrderResource {
  id: number
  order_number?: string
  client_name: string
  client_company?: string
  total_price: number
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  items: OrderItemResource[]
  created_at: string
  updated_at: string
}

export interface OrderItemResource {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  subtotal: number
}

// Client Resource
export interface ClientResource {
  id: number
  name: string
  company_name: string
  email: string
  phone: string
  created_at: string
}

// Dashboard Stats
export interface DashboardStats {
  total_pendapatan: number
  pesanan_pending: number
  produk_aktif: number
  total_klien_b2b: number
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}


