import { OrderManagement } from "@/components/orders/order-management"
import type { OrderResource } from "@/types/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

async function getOrders(): Promise<OrderResource[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pesanan</h1>
        <p className="text-muted-foreground">
          Verifikasi dan kelola pesanan B2B
        </p>
      </div>

      <OrderManagement initialOrders={orders} />
    </div>
  )
}

