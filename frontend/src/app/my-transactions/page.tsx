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
import { Receipt, Package, Calendar, DollarSign, AlertCircle } from "lucide-react"

const statusColors: Record<OrderResource['status'], string> = {
  menunggu_konfirmasi: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  diproses: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  selesai: 'bg-green-500/10 text-green-600 dark:text-green-400',
  dibatalkan: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const statusLabels: Record<OrderResource['status'], string> = {
  menunggu_konfirmasi: 'Waiting for Confirmation',
  diproses: 'Processing',
  selesai: 'Completed',
  dibatalkan: 'Cancelled',
}

export default function MyTransactionsPage() {
  const router = useRouter()
  const [orders, setOrders] = React.useState<OrderResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchMyOrders() {
      setLoading(true)
      setError(null)
      try {
        const response = await ordersApi.getMyOrders()
        if (response) {
          setOrders(response.data || [])
        } else {
          setError("Failed to load transactions")
        }
      } catch (err) {
        console.error("Error fetching my orders:", err)
        setError(err instanceof Error ? err.message : "Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }
    fetchMyOrders()
  }, [])

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading transactions...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div className="text-destructive text-center">{error}</div>
              <Button onClick={() => router.refresh()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Transactions</h1>
        <p className="text-muted-foreground">
          View and track all your order history
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <Receipt className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't made any orders yet. Start shopping to see your transactions here.
                </p>
                <Button onClick={() => router.push("/shop")}>
                  Go to Shop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Order #{order.id}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Placed on {formatDate(order.created_at)}
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
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Delivery Date</div>
                        <div className="font-medium">{formatDate(order.delivery_date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Items</div>
                        <div className="font-medium">
                          {order.products?.length || 0} item(s)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Total Price</div>
                        <div className="font-medium text-lg">{formatCurrency(order.total_price)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.products && order.products.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead className="text-right">Unit Price</TableHead>
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
                      <div className="text-sm font-medium mb-1">Special Notes:</div>
                      <div className="text-sm text-muted-foreground">{order.special_notes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

