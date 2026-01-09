"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ordersApi } from "@/lib/api"
import type { OrderResource } from "@/types/api"

// Format Rupiah
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format tanggal lokal Indonesia
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// Get status badge variant and label
const getStatusBadge = (status: OrderResource["status"]) => {
  const statusConfig = {
    menunggu_konfirmasi: {
      label: "Menunggu Konfirmasi",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    },
    diproses: {
      label: "Diproses",
      className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    },
    selesai: {
      label: "Selesai",
      className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    },
    dibatalkan: {
      label: "Dibatalkan",
      className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    },
  }

  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

// Handle status update
const handleStatusUpdate = async (
  orderId: number,
  newStatus: OrderResource["status"]
) => {
  try {
    const result = await ordersApi.updateStatus(orderId, newStatus)
    if (result) {
      toast.success("Status order berhasil diperbarui")
      // Refresh the table - you might want to pass a callback or use a state management solution
      window.location.reload()
    } else {
      toast.error("Gagal memperbarui status order")
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    toast.error("Terjadi kesalahan saat memperbarui status")
  }
}

export const columns: ColumnDef<OrderResource>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.id}</div>
    },
  },
  {
    accessorKey: "user",
    header: "Customer Name",
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <div className="font-medium">
          {user?.name || "N/A"}
          {user?.company_name && (
            <div className="text-sm text-muted-foreground">
              {user.company_name}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "delivery_date",
    header: "Delivery Date",
    cell: ({ row }) => {
      return <div>{formatDate(row.original.delivery_date)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return getStatusBadge(row.original.status)
    },
  },
  {
    accessorKey: "total_price",
    header: "Total Price",
    cell: ({ row }) => {
      return <div className="font-medium">{formatRupiah(row.original.total_price)}</div>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original
      const currentStatus = order.status

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currentStatus !== "menunggu_konfirmasi" && (
              <DropdownMenuItem
                onClick={() =>
                  handleStatusUpdate(order.id, "menunggu_konfirmasi")
                }
              >
                Menunggu Konfirmasi
              </DropdownMenuItem>
            )}
            {currentStatus !== "diproses" && (
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id, "diproses")}
              >
                Diproses
              </DropdownMenuItem>
            )}
            {currentStatus !== "selesai" && (
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id, "selesai")}
              >
                Selesai
              </DropdownMenuItem>
            )}
            {currentStatus !== "dibatalkan" && (
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id, "dibatalkan")}
              >
                Dibatalkan
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

