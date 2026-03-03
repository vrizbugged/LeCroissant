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
              <DialogTitle>Login Required</DialogTitle>
              <DialogDescription>Please login to view your cart.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => router.push("/")}>Cancel</Button>
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
        <div className="flex flex-col gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Cart</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Review products you will order</p>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Your cart is empty</p>
                <Button className="mt-6" onClick={() => router.push("/shop")}>Start Shopping</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  // GUARD CLAUSE: Cek apakah item/product rusak agar tidak blank
                  if (!item || !item.product) return null;

                  return (
                    <Card key={item.product.id || Math.random()}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex gap-3 sm:gap-4">
                          {/* GAMBAR PRODUK */}
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28 md:h-32 md:w-32">
                            {/* Gunakan Optional Chaining (?.) dan Fallback logic */}
                            {(item.product.image_url || item.product.image_url) ? (
                              <Image
                                src={item.product.image_url || item.product.image_url || ""}
                                alt={item.product.nama_produk || "Produk"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 80px, 128px"
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
                                <h3 className="text-base font-semibold leading-tight sm:text-lg">{item.product.nama_produk || "Produk Tanpa Nama"}</h3>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 sm:text-sm">
                                  {item.product.deskripsi || "Tidak ada deskripsi"}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.product.id)} className="h-8 w-8 text-destructive sm:h-9 sm:w-9">
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-base font-bold text-primary sm:text-lg">
                                  {/* Prioritaskan harga_formatted, fallback ke hitung manual */}
                                  {item.product.harga_formatted || formatPrice(item.product.harga_grosir)}
                                </p>
                                <p className="text-xs text-muted-foreground">per unit</p>
                              </div>

                              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
                                <div className="flex items-center gap-1 rounded-md border sm:gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 sm:h-8 sm:w-8" 
                                    onClick={() => {
                                      const minOrder = item.product.min_order || 10
                                      const newQuantity = item.quantity - 1
                                      if (newQuantity < minOrder) {
                                        toast.warning(`Minimal pembelian adalah ${minOrder} unit`)
                                        return
                                      }
                                      updateQuantity(item.product.id, newQuantity)
                                    }}
                                    disabled={item.quantity <= (item.product.min_order || 10)}
                                  >
                                    <MinusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                  <span className="w-9 text-center text-sm font-medium sm:w-12 sm:text-base">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 sm:h-8 sm:w-8" 
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  >
                                    <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                                <div className="text-right">
                                  <p className="text-[11px] text-muted-foreground sm:text-xs">Subtotal</p>
                                  <p className="text-sm font-bold sm:text-lg">
                                    {formatPrice((item.product.harga_grosir || 0) * item.quantity)}
                                  </p>
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
                <Card className="lg:sticky lg:top-24">
                  <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Item</span>
                        <span className="font-medium">{items.reduce((total, item) => total + item.quantity, 0)} unit</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold sm:text-lg">Total</span>
                        <span className="text-xl font-bold text-primary sm:text-2xl">{formatPrice(getTotalPrice())}</span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-4">
                      <Button onClick={() => router.push("/checkout")} className="w-full bg-orange-600 hover:bg-orange-700 text-white" size="lg">
                        Checkout
                      </Button>
                      <Button onClick={clearCart} variant="outline" className="w-full">Clear All</Button>
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
