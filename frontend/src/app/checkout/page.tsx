"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeftIcon, Loader2, MapPinIcon, PhoneIcon, UploadIcon, XIcon, Building2Icon, CopyIcon } from "lucide-react"
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
import { ordersApi, authApi } from "@/lib/api"
import type { UserResource } from "@/types/api"
import { toast } from "sonner"

const checkoutFormSchema = z.object({
  phone_number: z.string().min(1, "Nomor telepon wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  special_notes: z.string().optional(),
  payment_proof: z.instanceof(File).optional().or(z.literal("")),
}).refine((data) => {
  // Payment proof is optional but if provided must be valid file
  if (data.payment_proof && data.payment_proof instanceof File) {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (data.payment_proof.size > maxSize) {
      return false
    }
    if (!allowedTypes.includes(data.payment_proof.type)) {
      return false
    }
  }
  return true
}, {
  message: "File bukti pembayaran harus berupa gambar (JPG, PNG) atau PDF, maksimal 5MB",
  path: ["payment_proof"],
})

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

// Informasi rekening bank untuk transfer
const BANK_INFO = {
  bankName: "Bank BCA",
  accountNumber: "1234567890",
  accountHolder: "PT Le Croissant",
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, isAuthenticated, clearCart } = useCart()
  const [loading, setLoading] = React.useState(false)
  const [user, setUser] = React.useState<UserResource | null>(null)
  const [loadingUser, setLoadingUser] = React.useState(true)
  const [paymentProofPreview, setPaymentProofPreview] = React.useState<string | null>(null)

  // Initialize form first
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      phone_number: "",
      address: "",
      special_notes: "",
      payment_proof: undefined,
    },
  })

  // Load user data
  React.useEffect(() => {
    async function loadUser() {
      if (!isAuthenticated) {
        setLoadingUser(false)
        return
      }
      setLoadingUser(true)
      try {
        const userData = await authApi.me()
        if (userData) {
          setUser(userData)
          // Pre-fill form dengan data Client (prioritas) atau User
          // Jika user memiliki Client, gunakan data Client, jika tidak gunakan data User
          const phoneNumber = userData.client?.phone_number || userData.phone_number || ''
          const address = userData.client?.address || userData.address || ''
          
          form.setValue('phone_number', phoneNumber)
          form.setValue('address', address)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoadingUser(false)
      }
    }
    loadUser()
  }, [isAuthenticated, form])

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
        special_notes: data.special_notes || undefined,
        payment_proof: data.payment_proof instanceof File ? data.payment_proof : undefined,
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
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pesanan")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB")
        e.target.value = ''
        return
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error("File harus berupa gambar (JPG, PNG) atau PDF")
        e.target.value = ''
        return
      }
      form.setValue('payment_proof', file)
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPaymentProofPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPaymentProofPreview(null)
      }
    }
  }

  const removePaymentProof = () => {
    form.setValue('payment_proof', undefined)
    setPaymentProofPreview(null)
  }

  // Format nomor rekening dengan spasi untuk kemudahan membaca
  const formatAccountNumber = (accountNumber: string): string => {
    return accountNumber.replace(/(.{4})/g, '$1 ').trim()
  }

  // Copy nomor rekening ke clipboard
  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.accountNumber)
      toast.success("Nomor rekening berhasil disalin!")
    } catch (error) {
      toast.error("Gagal menyalin nomor rekening")
    }
  }

  if (!isAuthenticated || items.length === 0) {
    return null // Will redirect
  }

  // Show loading state while fetching user data
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
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
                Lengkapi informasi kontak dan upload bukti pembayaran untuk menyelesaikan pesanan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Informasi Kontak
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                disabled={loadingUser}
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
                              Alamat
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Masukkan alamat lengkap"
                                rows={4}
                                {...field}
                                disabled={loadingUser}
                              />
                            </FormControl>
                            <FormDescription>
                              Alamat lengkap Anda (dapat diedit jika perlu)
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

                  {/* Upload Bukti Pembayaran */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Upload Bukti Pembayaran
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Informasi Rekening Bank */}
                      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Building2Icon className="h-5 w-5 text-orange-600" />
                          <h3 className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                            Informasi Rekening Bank
                          </h3>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground min-w-[120px] font-medium">Bank</span>
                            <span className="font-semibold text-foreground">{BANK_INFO.bankName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground min-w-[120px] font-medium">Nomor Rekening</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                                {formatAccountNumber(BANK_INFO.accountNumber)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                                onClick={copyAccountNumber}
                                title="Salin nomor rekening"
                              >
                                <CopyIcon className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground min-w-[120px] font-medium">Atas Nama</span>
                            <span className="font-semibold text-foreground">{BANK_INFO.accountHolder}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground pt-3 border-t border-orange-200 dark:border-orange-800">
                          Silakan transfer sesuai dengan total pesanan ke rekening di atas, kemudian upload bukti pembayaran.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="payment_proof"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>File Bukti Pembayaran</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                {paymentProofPreview ? (
                                  <div className="relative">
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                      <div className="flex items-center gap-3">
                                        {form.watch('payment_proof') instanceof File && 
                                         form.watch('payment_proof').type.startsWith('image/') ? (
                                          <img
                                            src={paymentProofPreview}
                                            alt="Preview bukti pembayaran"
                                            className="w-20 h-20 object-cover rounded"
                                          />
                                        ) : (
                                          <div className="w-20 h-20 flex items-center justify-center bg-muted rounded">
                                            <span className="text-xs text-muted-foreground">PDF</span>
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {form.watch('payment_proof') instanceof File 
                                              ? form.watch('payment_proof').name 
                                              : 'File terpilih'}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {form.watch('payment_proof') instanceof File 
                                              ? `${(form.watch('payment_proof').size / 1024).toFixed(2)} KB`
                                              : ''}
                                          </p>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={removePaymentProof}
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <XIcon className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                    <UploadIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Upload bukti pembayaran (JPG, PNG, atau PDF)
                                    </p>
                                    <Input
                                      type="file"
                                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                                      onChange={handlePaymentProofChange}
                                      className="hidden"
                                      id="payment_proof_input"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => document.getElementById('payment_proof_input')?.click()}
                                    >
                                      Pilih File
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Upload bukti pembayaran Anda (maksimal 5MB). Format: JPG, PNG, atau PDF
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
