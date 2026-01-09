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
        setError(err instanceof Error ? err.message : "Gagal memuat data produk")
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
  const handleQuantityChange = (productId: number, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue < 0) return
    setQuantities((prev) => ({
      ...prev,
      [productId]: numValue,
    }))
  }

  // Handle add to cart
  const handleAddToCart = (product: ProductResource) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    const quantity = quantities[product.id] || 1
    if (quantity <= 0) {
      toast.error("Jumlah harus lebih dari 0")
      return
    }
    if (quantity > product.ketersediaan_stok) {
      toast.error(`Stok tersedia hanya ${product.ketersediaan_stok} unit`)
      return
    }
    addItem(product, quantity)
    toast.success(`${quantity}x ${product.nama_produk} ditambahkan ke keranjang`)
    // Reset quantity input
    setQuantities((prev) => ({
      ...prev,
      [product.id]: 1,
    }))
  }

  const handleLoginClick = () => {
    setShowLoginDialog(false)
    router.push("/login")
  }

  // Get stock badge color
  const getStockBadgeColor = (stock: number): string => {
    if (stock > 10) {
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
    }
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Login Confirmation Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Diperlukan</DialogTitle>
            <DialogDescription>
              Anda harus login terlebih dahulu untuk menambahkan produk ke keranjang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
            >
              Batal
            </Button>
            <Button onClick={handleLoginClick}>
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="flex flex-1 flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Katalog Pastry</h1>
              <p className="text-muted-foreground mt-1">
                Pesan produk pastry premium dengan harga grosir khusus mitra.
              </p>
            </div>

            {/* Search Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
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
              <p className="text-lg font-medium text-muted-foreground">Memuat produk...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-destructive">Error: {error}</p>
              <p className="text-sm mt-1 text-muted-foreground">
                Gagal memuat data produk. Silakan coba lagi nanti.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-muted-foreground mb-2">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Produk tidak ditemukan</p>
                <p className="text-sm mt-1">
                  {searchQuery
                    ? "Coba ubah kata kunci pencarian"
                    : "Belum ada produk yang tersedia"}
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
                    {/* Stock Badge */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={getStockBadgeColor(product.ketersediaan_stok)}
                      >
                        Stok: {product.ketersediaan_stok}
                      </Badge>
                    </div>

                    {/* Product Title */}
                    <h3 className="font-bold text-lg leading-tight">
                      {product.nama_produk}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {product.deskripsi || "Tidak ada deskripsi"}
                    </p>

                    {/* Price */}
                    <div className="mt-auto">
                      <p className="text-2xl font-bold text-primary">
                        {product.harga_formatted || formatPrice(product.harga_grosir)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Harga grosir per unit
                      </p>
                    </div>
                  </CardContent>

                  {/* Card Footer */}
                  <CardFooter className="flex flex-col gap-3 p-4 pt-0">
                    {/* Quantity Input */}
                    <div className="flex items-center gap-2 w-full">
                      <label htmlFor={`qty-${product.id}`} className="text-sm font-medium whitespace-nowrap">
                        Jumlah:
                      </label>
                      <Input
                        id={`qty-${product.id}`}
                        type="number"
                        min="1"
                        max={product.ketersediaan_stok}
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
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
                      className="w-full"
                      disabled={product.ketersediaan_stok === 0}
                    >
                      <ShoppingCartIcon className="mr-2 h-4 w-4" />
                      {product.ketersediaan_stok === 0
                        ? "Stok Habis"
                        : "Tambah ke Keranjang"}
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

