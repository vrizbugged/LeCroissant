"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCartIcon, TrashIcon, PlusIcon, MinusIcon, LogInIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Navbar } from "@/components/navbar/navbar"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

const MIN_PURCHASE_QUANTITY = 10

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, isAuthenticated } = useCart()
  
  // 1. STATE WAJIB: Untuk mencegah error Hydration & Blank
  const [isMounted, setIsMounted] = React.useState(false)
  const [showLoginDialog, setShowLoginDialog] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    if (!isAuthenticated) {
      setShowLoginDialog(true)
    }
  }, [isAuthenticated])

  // 2. HELPER AMAN: Mencegah crash jika harga null/error
  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // 3. PENCEGAH BLANK: Jangan render apapun sebelum browser siap
  if (!isMounted) return null

  // 4. JIKA BELUM LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Diperlukan</DialogTitle>
              <DialogDescription>Silakan login untuk melihat keranjang.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => router.push("/")}>Batal</Button>
              <Button onClick={() => { setShowLoginDialog(false); router.push("/login"); }}>Login</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // 5. TAMPILAN KERANJANG UTAMA
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Keranjang Belanja</h1>
            <p className="text-muted-foreground mt-1">Review produk yang akan Anda pesan</p>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Keranjang Anda kosong</p>
                <Button className="mt-6" onClick={() => router.push("/shop")}>Mulai Berbelanja</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  // GUARD CLAUSE: Cek apakah item/product rusak agar tidak blank
                  if (!item || !item.product) return null;

                  return (
                    <Card key={item.product.id || Math.random()}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* GAMBAR PRODUK */}
                          <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            {/* Gunakan Optional Chaining (?.) dan Fallback logic */}
                            {(item.product.image_url || item.product.image_url) ? (
                              <Image
                                src={item.product.image_url || item.product.image_url || ""}
                                alt={item.product.nama_produk || "Produk"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 96px, 128px"
                                unoptimized={true}
                                // Handle error gambar tanpa crash
                                onError={(e) => { e.currentTarget.style.display = 'none' }} 
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                                <span className="text-xs">No Image</span>
                              </div>
                            )}
                          </div>

                          {/* INFO PRODUK */}
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{item.product.nama_produk || "Produk Tanpa Nama"}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.product.deskripsi || "Tidak ada deskripsi"}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.product.id)} className="text-destructive">
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <div>
                                <p className="text-lg font-bold text-primary">
                                  {/* Prioritaskan harga_formatted, fallback ke hitung manual */}
                                  {item.product.harga_formatted || formatPrice(item.product.harga_grosir)}
                                </p>
                                <p className="text-xs text-muted-foreground">per unit</p>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 border rounded-md">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => {
                                      const newQuantity = item.quantity - 1
                                      if (newQuantity < MIN_PURCHASE_QUANTITY) {
                                        toast.warning(`Minimal pembelian adalah ${MIN_PURCHASE_QUANTITY} unit`)
                                        return
                                      }
                                      updateQuantity(item.product.id, newQuantity)
                                    }}
                                    disabled={item.quantity <= MIN_PURCHASE_QUANTITY}
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                  </Button>
                                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.product.ketersediaan_stok}
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="text-right hidden sm:block">
                                  <p className="text-lg font-bold">
                                    {formatPrice((item.product.harga_grosir || 0) * item.quantity)}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    Stok: {item.product.ketersediaan_stok || 0}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* RINGKASAN ORDER */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader><CardTitle>Ringkasan Pesanan</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Item</span>
                        <span className="font-medium">{items.reduce((total, item) => total + item.quantity, 0)} unit</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-primary">{formatPrice(getTotalPrice())}</span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-4">
                      <Button onClick={() => router.push("/checkout")} className="w-full bg-orange-600 hover:bg-orange-700 text-white" size="lg">
                        Checkout
                      </Button>
                      <Button onClick={clearCart} variant="outline" className="w-full">Hapus Semua</Button>
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