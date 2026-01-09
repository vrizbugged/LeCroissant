"use client"

import * as React from "react"
import { ordersApi } from "@/lib/api"
import { OrderManagement } from "@/components/orders/order-management"
import type { OrderResource } from "@/types/api"

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<OrderResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      setError(null)
      try {
        const ordersResponse = await ordersApi.getAll()
        if (ordersResponse) {
          setOrders(ordersResponse.data || [])
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError(err instanceof Error ? err.message : "Gagal memuat data pesanan")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Memuat data pesanan...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return <OrderManagement initialOrders={orders} />
}


