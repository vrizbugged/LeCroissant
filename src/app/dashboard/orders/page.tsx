import { ordersApi } from "@/lib/api"
import { OrderManagement } from "@/components/orders/order-management"

export default async function OrdersPage() {
  const orders = await ordersApi.getAll()

  return <OrderManagement initialOrders={orders} />
}


