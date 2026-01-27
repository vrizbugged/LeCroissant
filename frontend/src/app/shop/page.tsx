"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { SearchIcon, ShoppingCartIcon, Loader2Icon } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Navbar } from "@/components/navbar/navbar"
import { productsApi } from "@/lib/api"
import type { ProductResource } from "@/types/api"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"


export default function ShopPage() {
  const { addItem, isAuthenticated } = useCart()
  const router = useRouter()
  const [products, setProducts] = React.useState<ProductResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [quantities, setQuantities] = React.useState<Record<number, number>>({})
  const [showLoginDialog, setShowLoginDialog] = React.useState(false)

  // Fetch products from API
  React.useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError(null)
      try {
        // Fetch hanya produk dengan status Aktif untuk katalog
        const productsData = await productsApi.getAll({ status: "Aktif" })
        setProducts(productsData || [])
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Failed to load product data")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Format harga ke Rupiah
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Filter produk berdasarkan search
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.deskripsi && product.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSearch && product.status === "Aktif"
    })
  }, [searchQuery, products])

  // Handle quantity change
  const handleQuantityChange = (productId: number, value: string, minOrder: number) => {
    const numValue = parseInt(value) || 0
    if (numValue < 0) return
    // Enforce minimal purchase quantity
    const finalValue = numValue < minOrder ? minOrder : numValue
    setQuantities((prev) => ({
      ...prev,
      [productId]: finalValue,
    }))
    if (numValue > 0 && numValue < minOrder) {
      toast.warning(`Minimum purchase is ${minOrder} units`)
    }
  }

  // Handle add to cart
  const handleAddToCart = (product: ProductResource) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    const minOrder = product.min_order || 10
    let quantity = quantities[product.id] || minOrder
    
    // Enforce minimal purchase quantity
    if (quantity < minOrder) {
      quantity = minOrder
      setQuantities((prev) => ({
        ...prev,
        [product.id]: minOrder,
      }))
      toast.warning(`Minimum purchase is ${minOrder} units. Quantity changed to ${minOrder}`)
    }
    
    
    addItem(product, quantity)
    toast.success(`${quantity}x ${product.nama_produk} added to cart`)
    // Reset quantity input to minimum
    setQuantities((prev) => ({
      ...prev,
      [product.id]: minOrder,
    }))
  }

  const handleLoginClick = () => {
    setShowLoginDialog(false)
    router.push("/login")
  }


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Login Confirmation Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You must login first to add products to cart.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLoginClick}>
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="flex flex-1 flex-col gap-6">
          {/* Banner Section */}
          <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-lg overflow-hidden shadow-lg mb-4">
            <Image
              src="/image/almondbg.png"
              alt="Pastry Banner"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
            {/* Overlay untuk readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            {/* Banner Content */}
            <div className="relative z-10 h-full flex items-center px-6 md:px-12">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                  Premium Pastry Collection
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-white/90">
                  Discover our handcrafted pastries made with the finest ingredients
                </p>
              </div>
            </div>
          </div>

          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Explore Our Products</h1>
              <p className="text-muted-foreground mt-1">
                Order premium pastry products with prices for partners.
              </p>
            </div>

            {/* Search Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2Icon className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-destructive">Error: {error}</p>
              <p className="text-sm mt-1 text-muted-foreground">
                Failed to load product data. Please try again later.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-muted-foreground mb-2">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Products not found</p>
                <p className="text-sm mt-1">
                  {searchQuery
                    ? "Try changing your search keywords"
                    : "No products available yet"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Card Header - Image */}
                  <CardHeader className="p-0">
                    <div className="relative w-full aspect-square overflow-hidden bg-muted">
                      {product.gambar_url ? (
                        <Image
                          src={product.gambar_url}
                          alt={product.nama_produk}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          unoptimized={true}
                          onError={(e) => {
                            // Fallback jika gambar gagal dimuat
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center h-full bg-muted text-muted-foreground"><span class="text-sm">No Image</span></div>'
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  {/* Card Content */}
                  <CardContent className="flex-1 flex flex-col gap-3 p-4">
                    {/* Product Title */}
                    <h3 className="font-bold text-lg leading-tight">
                      {product.nama_produk}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {product.deskripsi || "No description"}
                    </p>

                    {/* Price */}
                    <div className="mt-auto">
                      <p className="text-2xl font-bold text-primary">
                        {product.harga_formatted || formatPrice(product.harga_grosir)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Wholesale price per unit
                      </p>
                    </div>
                  </CardContent>

                  {/* Card Footer */}
                  <CardFooter className="flex flex-col gap-3 p-4 pt-0">
                    {/* Quantity Input */}
                    <div className="flex items-center gap-2 w-full">
                      <label htmlFor={`qty-${product.id}`} className="text-sm font-medium whitespace-nowrap">
                        Quantity:
                      </label>
                      <Input
                        id={`qty-${product.id}`}
                        type="number"
                        min={product.min_order || 10}
                        value={quantities[product.id] || (product.min_order || 10)}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value, product.min_order || 10)}
                        className="flex-1"
                      />
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddToCart(product)
                      }}
                      className="w-full bg-orange-500"
                    >
                      <ShoppingCartIcon className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

