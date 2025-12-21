import { productsApi } from "@/lib/api"
import { ProductManagement } from "@/components/products/product-management"

export default async function ProductsPage() {
  const products = await productsApi.getAll()

  return <ProductManagement initialProducts={products} />
}


