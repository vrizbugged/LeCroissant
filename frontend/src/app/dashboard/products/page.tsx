"use client"

import * as React from "react"
import { productsApi } from "@/lib/api"
import { ProductManagement } from "@/components/products/product-management"
import type { ProductResource } from "@/types/api"

export default function ProductsPage() {
  const [products, setProducts] = React.useState<ProductResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError(null)
      try {
        const productsData = await productsApi.getAll()
        setProducts(productsData || [])
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Gagal memuat data produk")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Memuat data produk...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return <ProductManagement initialProducts={products} />
}


