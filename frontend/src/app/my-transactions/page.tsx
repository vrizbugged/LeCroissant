"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ordersApi } from "@/lib/api"
import type { OrderResource } from "@/types/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Receipt, Package, Calendar, DollarSign, AlertCircle, CheckCircle2, Clock, Truck, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar/navbar"

const statusColors: Record<OrderResource['status'], string> = {
  menunggu_konfirmasi: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  diproses: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  selesai: 'bg-green-500/10 text-green-600 dark:text-green-400',
  dibatalkan: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const statusLabels: Record<OrderResource['status'], string> = {
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  diproses: 'Diproses',
  selesai: 'Pesanan Selesai',
  dibatalkan: 'Dibatalkan',
}

export default function MyTransactionsPage() {
  const router = useRouter()
  const [orders, setOrders] = React.useState<OrderResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch orders
  const fetchMyOrders = React.useCallback(async () => {
    setError(null)
    try {
      const response = await ordersApi.getMyOrders()
      if (response) {
        const sortedOrders = (response.data || []).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setOrders(sortedOrders)
      } else {
        setError("Failed to load transactions")
      }
    } catch (err) {
      console.error("Error fetching my orders:", err)
      setError(err instanceof Error ? err.message : "Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchMyOrders()
  }, [fetchMyOrders])

  // Real-time polling untuk update status order terbaru
  React.useEffect(() => {
    if (orders.length === 0) return

    const latestOrder = orders[0]
    // Hanya poll jika order belum selesai atau dibatalkan
    if (latestOrder.status === 'selesai' || latestOrder.status === 'dibatalkan') {
      return
    }

    const interval = setInterval(() => {
      fetchMyOrders()
    }, 5000) // Poll setiap 5 detik

    return () => clearInterval(interval)
  }, [orders, fetchMyOrders])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get latest order for status tracking
  const latestOrder = orders.length > 0 ? orders[0] : null

  // Status steps untuk tracking
  const statusSteps = [
    { key: 'menunggu_konfirmasi' as const, label: 'Menunggu Konfirmasi', icon: Clock },
    { key: 'diproses' as const, label: 'Siap Di-Pickup', icon: Truck },
    { key: 'selesai' as const, label: 'Pesanan Selesai', icon: CheckCircle2 },
  ]

  const getStatusStepIndex = (status: OrderResource['status']): number => {
    if (status === 'dibatalkan') return -1
    return statusSteps.findIndex(step => step.key === status)
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="text-destructive text-center">{error}</div>
                <Button onClick={() => fetchMyOrders()}>Coba Lagi</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Transaksi Saya</h1>
          <p className="text-muted-foreground">
            Lacak status pesanan dan lihat histori transaksi Anda
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Receipt className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Belum Ada Transaksi</h3>
                  <p className="text-muted-foreground mb-4">
                    Anda belum melakukan pemesanan. Mulai berbelanja untuk melihat transaksi di sini.
                  </p>
                  <Button onClick={() => router.push("/shop")} className="bg-orange-600 hover:bg-orange-700 text-white">
                    Mulai Berbelanja
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Section 1: Status Tracking Order Terbaru */}
            {latestOrder && (
              <Card>
                <CardHeader>
                  <CardTitle>Status Pesanan Terbaru</CardTitle>
                  <CardDescription>
                    Nomor Order: <span className="font-semibold text-foreground">#{latestOrder.id}</span>
                    {latestOrder.status === 'dibatalkan' && (
                      <Badge className="ml-2 bg-red-500/10 text-red-600 dark:text-red-400">
                        Dibatalkan
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Progress Indicator - hanya tampil jika tidak dibatalkan */}
                  {latestOrder.status !== 'dibatalkan' && (
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        {statusSteps.map((step, index) => {
                          const currentStepIndex = getStatusStepIndex(latestOrder.status)
                          const isActive = index <= currentStepIndex
                          const isCurrent = index === currentStepIndex
                          const Icon = step.icon

                          return (
                            <React.Fragment key={step.key}>
                              <div className="flex flex-col items-center flex-1">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                                    isActive
                                      ? 'bg-orange-600 border-orange-600 text-white'
                                      : 'bg-background border-muted text-muted-foreground'
                                  }`}
                                >
                                  <Icon className="h-6 w-6" />
                                </div>
                                <p
                                  className={`mt-2 text-sm font-medium text-center ${
                                    isActive ? 'text-foreground' : 'text-muted-foreground'
                                  }`}
                                >
                                  {step.label}
                                </p>
                                {isCurrent && (
                                  <Badge className="mt-1 bg-orange-600 text-white">
                                    Status Saat Ini
                                  </Badge>
                                )}
                              </div>
                              {index < statusSteps.length - 1 && (
                                <div
                                  className={`flex-1 h-0.5 mx-2 ${
                                    isActive ? 'bg-orange-600' : 'bg-muted'
                                  }`}
                                />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Harga</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(latestOrder.total_price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal Pemesanan</p>
                      <p className="font-medium">{formatDate(latestOrder.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jumlah Item</p>
                      <p className="font-medium">
                        {latestOrder.products?.reduce((sum, p) => sum + p.pivot.quantity, 0) || 0} unit
                      </p>
                    </div>
                  </div>

                  {/* Detail Produk Pesanan Terbaru */}
                  {latestOrder.products && latestOrder.products.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">Detail Produk</h4>
                      <div className="space-y-2">
                        {latestOrder.products.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium text-sm">{product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {product.pivot.quantity} × {formatCurrency(product.pivot.price_at_purchase)}
                                </div>
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(product.pivot.quantity * product.pivot.price_at_purchase)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 2: Histori Transaksi */}
            {orders.length > 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Histori Transaksi</h2>
                <div className="space-y-4">
                  {orders.slice(1).map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Pesanan #{order.id}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Dibuat pada {formatDate(order.created_at)}
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm text-muted-foreground">Jumlah Item</div>
                              <div className="font-medium">
                                {order.products?.reduce((sum, p) => sum + p.pivot.quantity, 0) || 0} unit
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm text-muted-foreground">Total Harga</div>
                              <div className="font-medium text-lg text-orange-600">{formatCurrency(order.total_price)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm text-muted-foreground">Tanggal</div>
                              <div className="font-medium">{formatDate(order.created_at)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        {order.products && order.products.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Detail Produk</h4>
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead className="text-right">Harga Satuan</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.products.map((product) => (
                                    <TableRow key={product.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          {product.image_url && (
                                            <img
                                              src={product.image_url}
                                              alt={product.name}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          )}
                                          <div>
                                            <div className="font-medium">{product.name}</div>
                                            {product.description && (
                                              <div className="text-sm text-muted-foreground">
                                                {product.description}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>{product.pivot.quantity}</TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(product.pivot.price_at_purchase)}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatCurrency(
                                          product.pivot.quantity * product.pivot.price_at_purchase
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Special Notes */}
                        {order.special_notes && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="text-sm font-medium mb-1">Catatan Khusus:</div>
                            <div className="text-sm text-muted-foreground">{order.special_notes}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}