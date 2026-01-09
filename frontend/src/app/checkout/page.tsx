"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeftIcon, Loader2Icon, CalendarIcon, MapPinIcon, PhoneIcon, MailIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar/navbar"
import { useCart } from "@/contexts/cart-context"
import { ordersApi } from "@/lib/api"
import { toast } from "sonner"

const checkoutFormSchema = z.object({
  delivery_date: z.string().min(1, "Tanggal pengiriman wajib diisi"),
  phone_number: z.string().min(1, "Nomor telepon wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  special_notes: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, isAuthenticated, clearCart } = useCart()
  const [loading, setLoading] = React.useState(false)

  // Redirect jika belum login atau cart kosong
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (items.length === 0) {
      toast.error("Keranjang masih kosong")
      router.push("/cart")
      return
    }
  }, [isAuthenticated, items.length, router])

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      delivery_date: "",
      phone_number: "",
      address: "",
      special_notes: "",
    },
  })

  // Format harga ke Rupiah
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Keranjang masih kosong")
      router.push("/cart")
      return
    }

    setLoading(true)
    try {
      // Prepare order data
      const orderData = {
        delivery_date: data.delivery_date,
        special_notes: data.special_notes || undefined,
        products: items.map((item) => ({
          id: item.product.id,
          quantity: item.quantity,
        })),
      }

      const order = await ordersApi.create(orderData)

      if (order) {
        toast.success("Pesanan berhasil dibuat!")
        clearCart()
        router.push(`/my-transactions`)
      } else {
        toast.error("Gagal membuat pesanan. Silakan coba lagi.")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Terjadi kesalahan saat membuat pesanan")
    } finally {
      setLoading(false)
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]

  if (!isAuthenticated || items.length === 0) {
    return null // Will redirect
  }

  const totalPrice = getTotalPrice()
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/cart")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
              <p className="text-muted-foreground mt-1">
                Lengkapi informasi pengiriman untuk menyelesaikan pesanan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Delivery Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-orange-600" />
                        Informasi Pengiriman
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="delivery_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal Pengiriman</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                min={today}
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormDescription>
                              Pilih tanggal pengiriman yang diinginkan
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-orange-600" />
                              Nomor Telepon
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="081234567890"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Nomor telepon yang dapat dihubungi
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4 text-orange-600" />
                              Alamat Pengiriman
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Masukkan alamat lengkap pengiriman"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Alamat lengkap untuk pengiriman pesanan
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="special_notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catatan Khusus (Opsional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Catatan tambahan untuk pesanan Anda..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Tambahkan catatan khusus jika diperlukan
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/cart")}
                      className="flex-1"
                    >
                      Kembali ke Keranjang
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        "Buat Pesanan"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          {item.product.gambar_url ? (
                            <Image
                              src={item.product.gambar_url}
                              alt={item.product.nama_produk}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                              <span className="text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {item.product.nama_produk}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatPrice(item.product.harga_grosir)}
                          </p>
                          <p className="text-sm font-semibold mt-1">
                            {formatPrice(item.product.harga_grosir * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({items.length} item)</span>
                      <span className="font-medium">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Item</span>
                      <span className="font-medium">{totalItems} unit</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
