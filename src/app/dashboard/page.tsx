import { dashboardApi } from "@/lib/api"
import { DashboardKPICards } from "@/components/dashboard/dashboard-kpi-cards"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"

export default async function DashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    dashboardApi.getStats(),
    dashboardApi.getRecentOrders(5),
  ])

  return (
    <>
      <DashboardKPICards stats={stats} />
      <RecentOrdersTable orders={recentOrders} />
    </>
  )
}


