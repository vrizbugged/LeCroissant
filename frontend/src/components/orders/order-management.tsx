"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { OrderResource } from "@/types/api"
import { ordersApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"

const statusColors: Record<OrderResource['status'], string> = {
  menunggu_konfirmasi: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  diproses: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  siap_di_pickup: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  selesai: 'bg-green-500/10 text-green-600 dark:text-green-400',
  dibatalkan: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const statusLabels: Record<OrderResource['status'], string> = {
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  diproses: 'Diproses',
  siap_di_pickup: 'Siap Di-Pickup',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

const statusOptions: OrderResource['status'][] = [
  'menunggu_konfirmasi',
  'diproses',
  'siap_di_pickup',
  'selesai',
  'dibatalkan',
]

interface OrderManagementProps {
  initialOrders: OrderResource[]
}

export function OrderManagement({ initialOrders }: OrderManagementProps) {
  const router = useRouter()
  const [orders, setOrders] = React.useState<OrderResource[]>(initialOrders || [])
  const [cancelDialog, setCancelDialog] = React.useState<{
    open: boolean
    orderId: number | null
  }>({ open: false, orderId: null })
  const [cancellationReason, setCancellationReason] = React.useState("")

  const handleStatusChange = async (
    orderId: number, 
    newStatus: OrderResource['status'],
    cancellationReason?: string | null
  ) => {
    try {
      const updated = await ordersApi.updateStatus(orderId, newStatus, cancellationReason)
      if (updated) {
        setOrders(orders.map(o => o.id === orderId ? updated : o))
        toast.success("Status pesanan berhasil diperbarui")
        router.refresh()
      } else {
        toast.error("Gagal memperbarui status pesanan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    }
  }

  const handleSelectChange = (orderId: number, newStatus: OrderResource['status']) => {
    // Jika status yang dipilih adalah "dibatalkan", buka dialog
    if (newStatus === 'dibatalkan') {
      setCancelDialog({ open: true, orderId })
    } else {
      // Untuk status lain, langsung update
      handleStatusChange(orderId, newStatus)
    }
  }

  const handleCancelConfirm = () => {
    if (!cancelDialog.orderId) return
    
    if (!cancellationReason.trim()) {
      toast.error("Alasan pembatalan wajib diisi")
      return
    }

    handleStatusChange(cancelDialog.orderId, 'dibatalkan', cancellationReason.trim())
    setCancelDialog({ open: false, orderId: null })
    setCancellationReason("")
  }

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

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Pesanan</CardTitle>
          <CardDescription>Verifikasi dan kelola pesanan B2B</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Total Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada pesanan
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.client?.name || order.user?.name || 'N/A'}
                          </div>
                          {(order.client?.company_name || order.user?.company_name) && (
                            <div className="text-sm text-muted-foreground">
                              {order.client?.company_name || order.user?.company_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.delivery_date)}</TableCell>
                      <TableCell>{formatCurrency(order.total_price)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleSelectChange(order.id, value as OrderResource['status'])
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {statusLabels[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog untuk input alasan pembatalan */}
      <Dialog 
        open={cancelDialog.open} 
        onOpenChange={(open) => {
          setCancelDialog({ open, orderId: cancelDialog.orderId })
          if (!open) {
            setCancellationReason("")
          }
        }}
      >
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
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">
                {cancellationReason.length}/500 karakter
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCancelDialog({ open: false, orderId: null })
                setCancellationReason("")
              }}
            >
              Batal
            </Button>
            <Button onClick={handleCancelConfirm} variant="destructive">
              Konfirmasi Pembatalan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


