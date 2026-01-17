"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

// Check if order is new (created within last 24 hours and not viewed)
const isOrderNew = (orderId: number, createdAt?: string | null): boolean => {
  if (!createdAt) return false
  
  // Check if order has been viewed
  if (typeof window !== 'undefined') {
    const viewedOrders = JSON.parse(localStorage.getItem('viewed_orders') || '[]')
    if (viewedOrders.includes(orderId)) return false
  }
  
  const orderDate = new Date(createdAt)
  const now = new Date()
  const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)
  return diffInHours <= 24
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
    siap_di_pickup: {
      label: "Siap Di-Pickup",
      className: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
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

// Component untuk cancel dialog
function CancelOrderDialog({ 
  open, 
  onOpenChange, 
  onConfirm 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = React.useState("")

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error("Alasan pembatalan wajib diisi")
      return
    }
    onConfirm(reason.trim())
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batalkan Pesanan</DialogTitle>
          <DialogDescription>
            Masukkan alasan pembatalan pesanan. Alasan ini akan ditampilkan kepada customer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">Alasan Pembatalan *</Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Contoh: Stok tidak mencukupi, masalah pembayaran, dll."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              {reason.length}/500 karakter
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            Konfirmasi Pembatalan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const columns: ColumnDef<OrderResource>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const order = row.original
      const isNew = isOrderNew(order.id, order.created_at)
      
      // Mark as viewed when cell is rendered (only once)
      if (isNew && typeof window !== 'undefined') {
        const viewedOrders = JSON.parse(localStorage.getItem('viewed_orders') || '[]')
        if (!viewedOrders.includes(order.id)) {
          viewedOrders.push(order.id)
          localStorage.setItem('viewed_orders', JSON.stringify(viewedOrders))
          // Dispatch custom event to notify sidebar
          window.dispatchEvent(new CustomEvent('ordersViewed'))
        }
      }
      
      return (
        <div className="flex items-center gap-2">
          <div className="font-medium">#{order.id}</div>
          {isNew && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300 text-xs">
              Baru
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "client",
    header: "Customer Name",
    cell: ({ row }) => {
      const client = row.original.client
      const user = row.original.user // Fallback
      return (
        <div className="font-medium">
          {client?.name || user?.name || "N/A"}
          {(client?.company_name || user?.company_name) && (
            <div className="text-sm text-muted-foreground">
              {client?.company_name || user?.company_name}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "delivery_date",
    header: "Tanggal Pengiriman",
    cell: ({ row }) => {
      const order = row.original
      const isNew = isOrderNew(order.id, order.created_at)
      return (
        <div className="flex items-center gap-2">
          <div>{formatDate(order.delivery_date)}</div>
          {isNew && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300 text-xs">
              Baru
            </Badge>
          )}
        </div>
      )
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
    header: "Aksi",
    cell: ({ row }) => {
      const order = row.original
      const currentStatus = order.status
      const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false)

      const handleStatusUpdate = async (
        orderId: number,
        newStatus: OrderResource["status"],
        cancellationReason?: string | null
      ) => {
        try {
          const result = await ordersApi.updateStatus(orderId, newStatus, cancellationReason)
          if (result) {
            toast.success("Status order berhasil diperbarui")
            window.location.reload()
          } else {
            toast.error("Gagal memperbarui status order")
          }
        } catch (error) {
          console.error("Error updating order status:", error)
          toast.error("Terjadi kesalahan saat memperbarui status")
        }
      }

      const handleCancelClick = () => {
        setCancelDialogOpen(true)
      }

      const handleCancelConfirm = (reason: string) => {
        handleStatusUpdate(order.id, "dibatalkan", reason)
      }

      return (
        <>
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
              {currentStatus !== "siap_di_pickup" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(order.id, "siap_di_pickup")}
                >
                  Siap Di-Pickup
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
                  onClick={handleCancelClick}
                  className="text-red-600 focus:text-red-600"
                >
                  Dibatalkan
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <CancelOrderDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onConfirm={handleCancelConfirm}
          />
        </>
      )
    },
  },
]

