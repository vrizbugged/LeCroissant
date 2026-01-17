"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Package, Users, RefreshCw } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { DashboardStats, OrderResource } from "@/types/api"
import { dashboardApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { toast } from "sonner"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats>({
    total_pendapatan: 0,
    pesanan_pending: 0,
    produk_aktif: 0,
    total_klien_b2b: 0,
  })
  const [orders, setOrders] = React.useState<OrderResource[]>([])
  const [chartData, setChartData] = React.useState<{ month: string; revenue: number; orders: number }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const fetchDashboardData = React.useCallback(async (showToast = false) => {
    try {
      setIsRefreshing(true)
      const [statsData, ordersData, chartDataResponse] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentOrders(5),
        dashboardApi.getChartData(),
      ])

      if (statsData) {
        setStats(statsData)
      }

      if (ordersData) {
        setOrders(ordersData)
      }

      if (chartDataResponse) {
        // Transform chart data to match chart component format
        const transformedData = chartDataResponse.months.map((month, index) => ({
          month,
          revenue: chartDataResponse.revenue[index] || 0,
          orders: chartDataResponse.orders[index] || 0,
        }))
        setChartData(transformedData)
      }

      if (showToast) {
        toast.success("Dashboard updated")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      if (showToast) {
        toast.error("Failed to refresh dashboard")
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Initial fetch on mount (when user refreshes page)
  React.useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount, not on every render

  const kpiCards = [
    {
      title: "Total Pendapatan",
      value: `Rp ${stats.total_pendapatan.toLocaleString("id-ID")}`,
      icon: DollarSign,
      description: "Pendapatan bulan ini",

    },
    {
      title: "Pesanan Pending",
      value: stats.pesanan_pending,
      icon: ShoppingCart,
      description: "Menunggu verifikasi",
      href: "/dashboard/orders"
    },
    {
      title: "Produk Aktif",
      value: stats.produk_aktif,
      icon: Package,
      description: "Produk tersedia",
      href: "/dashboard/products"
    },
    {
      title: "Total Klien B2B",
      value: stats.total_klien_b2b,
      icon: Users,
      description: "Klien terdaftar",
      href: "/dashboard/clients"
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      menunggu_konfirmasi: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      diproses: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      siap_di_pickup: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      selesai: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      dibatalkan: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    }
    return variants[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      menunggu_konfirmasi: "Pending",
      diproses: "Processing",
      siap_di_pickup: "Ready to Pickup",
      selesai: "Done",
      dibatalkan: "Cancelled",
    }
    return labels[status] || status
  }

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(25, 100.00%, 50.00%)", 
    },
  } satisfies ChartConfig

  const ordersChartConfig = {
    orders: {
      label: "Orders",
      color: "hsl(25, 100.00%, 50.00%)",
    },
  } satisfies ChartConfig

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview bisnis pastry Le Croissant
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((card, index) => {

        const cardContent = (
          <Card 
            className={`h-full transition-all duration-300 ${
              card.href 
                ? "hover:shadow-lg hover:border-orange-500/50 cursor-pointer" 
                : "border-border opacity-100" 
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )


        if (card.href) {
          return (
            <Link key={index} href={card.href} className="block">
              {cardContent}
            </Link>
          )
        }

        return (
          <div key={index} className="block">
            {cardContent}
          </div>
        )
      })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Pendapatan 6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={revenueChartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                    top: 10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="revenue"
                    type="natural"
                    fill="var(--color-revenue)"
                    fillOpacity={0.4}
                    stroke="var(--color-revenue)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
            <CardDescription>Jumlah pesanan 6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={ordersChartConfig}>
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                    top: 10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="orders"
                    fill="var(--color-orders)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
          <CardDescription>
            Daftar pesanan terbaru dari klien B2B
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Nama Klien</TableHead>
                  <TableHead>Total Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.id}
                    </TableCell>
                    <TableCell>
                      {order.client?.name || order.user?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      Rp {order.total_price.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Belum ada pesanan
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
