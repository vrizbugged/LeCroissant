import { ProductManagement } from "@/components/products/product-management"
import { productsApi } from "@/lib/api-products"
import type { ProductResource } from "@/types/api"

async function getProducts(): Promise<ProductResource[]> {
  try {
    return await productsApi.getAll()
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Produk</h1>
        <p className="text-muted-foreground">
          Kelola produk pastry untuk B2B clients
        </p>
      </div>

      <ProductManagement initialProducts={products} />
    </div>
  )
}

