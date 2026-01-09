"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCartIcon, TrashIcon, PlusIcon, MinusIcon, LogInIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, isAuthenticated } = useCart()
  
  // State untuk Dialog Login
  const [showLoginDialog, setShowLoginDialog] = React.useState(false)

  // Efek: Jika tidak login, munculkan Dialog (BUKAN Redirect)
  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
    }
  }, [isAuthenticated])

  // Format harga ke Rupiah
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    if (items.length === 0) {
      toast.error("Keranjang masih kosong")
      return
    }
    // TODO: Implementasi checkout
    toast.info("Fitur checkout akan segera tersedia")
  }

  const handleLoginClick = () => {
    setShowLoginDialog(false)
    router.push("/login")
  }

  // Tampilan jika User Belum Login (Background di belakang Dialog)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* --- Dialog Login (Muncul Otomatis) --- */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Diperlukan</DialogTitle>
              <DialogDescription>
                Anda harus login terlebih dahulu untuk melihat dan mengelola keranjang belanja Anda.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => router.push("/")} // Kalau batal, kembali ke Home
              >
                Batal
              </Button>
              <Button onClick={handleLoginClick}>
                Login
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* --------------------------------------- */}

        <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                   <ShoppingCartIcon className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Login Diperlukan</h2>
              <p className="text-muted-foreground mb-6">
                Silakan login untuk melihat barang belanjaan Anda.
              </p>
              <Button onClick={handleLoginClick} className="w-full">
                <LogInIcon className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Tampilan Normal (Jika Sudah Login)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Keranjang Belanja</h1>
            <p className="text-muted-foreground mt-1">
              Review produk yang akan Anda pesan
            </p>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Keranjang Anda kosong</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Mulai berbelanja untuk menambahkan produk ke keranjang
                </p>
                <Button className="mt-6" asChild>
                  <a href="/shop">Mulai Berbelanja</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.product.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          {item.product.gambar_url ? (
                            <Image
                              src={item.product.gambar_url}
                              alt={item.product.nama_produk}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 96px, 128px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                              <span className="text-xs">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.product.nama_produk}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.product.deskripsi || "Tidak ada deskripsi"}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            {/* Price */}
                            <div>
                              <p className="text-lg font-bold text-primary">
                                {item.product.harga_formatted || formatPrice(item.product.harga_grosir)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                per unit
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 border rounded-md">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="text-right hidden sm:block">
                                <p className="text-lg font-bold">
                                  {formatPrice(item.product.harga_grosir * item.quantity)}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  Stok: {item.product.ketersediaan_stok}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Ringkasan Pesanan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal ({items.length} item)</span>
                        <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Item</span>
                        <span className="font-medium">
                          {items.reduce((total, item) => total + item.quantity, 0)} unit
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-4">
                      <Button
                        onClick={handleCheckout}
                        className="w-full"
                        size="lg"
                      >
                        Checkout
                      </Button>
                      <Button
                        onClick={clearCart}
                        variant="outline"
                        className="w-full"
                      >
                        Hapus Semua
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}