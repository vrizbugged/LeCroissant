import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import type { DashboardStats, OrderResource } from "@/types/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

async function getDashboardData() {
  try {
    // Fetch stats and recent orders
    const [statsRes, ordersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/dashboard/stats`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      }),
      fetch(`${API_BASE_URL}/orders?limit=5`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      }),
    ])

    const stats: DashboardStats = statsRes.ok
      ? (await statsRes.json()).data || {
          total_pendapatan: 0,
          pesanan_pending: 0,
          produk_aktif: 0,
          total_klien_b2b: 0,
        }
      : {
          total_pendapatan: 0,
          pesanan_pending: 0,
          produk_aktif: 0,
          total_klien_b2b: 0,
        }

    const orders: OrderResource[] = ordersRes.ok
      ? (await ordersRes.json()).data || []
      : []

    return { stats, orders }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      stats: {
        total_pendapatan: 0,
        pesanan_pending: 0,
        produk_aktif: 0,
        total_klien_b2b: 0,
      },
      orders: [],
    }
  }
}

export default async function DashboardPage() {
  const { stats, orders } = await getDashboardData()

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
    },
    {
      title: "Produk Aktif",
      value: stats.produk_aktif,
      icon: Package,
      description: "Produk tersedia",
    },
    {
      title: "Total Klien B2B",
      value: stats.total_klien_b2b,
      icon: Users,
      description: "Klien terdaftar",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview bisnis pastry Le Croissant
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
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
                      {order.order_number || `#${order.id}`}
                    </TableCell>
                    <TableCell>{order.client_name || "N/A"}</TableCell>
                    <TableCell>
                      Rp {order.total_price.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(order.status)}>
                        {order.status}
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

