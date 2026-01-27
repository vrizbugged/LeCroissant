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
  menunggu_konfirmasi: 'Pending',
  diproses: 'Processing',
  siap_di_pickup: 'Ready to Pick-Up',
  selesai: 'Done',
  dibatalkan: 'Cancelled',
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

type SortField = 'status' | 'date' | OrderResource['status'] | null
type SortDirection = 'asc' | 'desc'

export function OrderManagement({ initialOrders }: OrderManagementProps) {
  const router = useRouter()
  const [orders, setOrders] = React.useState<OrderResource[]>(initialOrders || [])
  const [sortField, setSortField] = React.useState<SortField>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = React.useState<OrderResource['status'] | null>(null)
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
        toast.success("Order status updated successfully")
        router.refresh()
      } else {
        toast.error("Failed to update order status")
      }
    } catch (error) {
      toast.error("An error occurred")
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
      toast.error("Cancellation reason is required")
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

  // Check if order is new (created within last 24 hours) and not viewed
  const isOrderNew = (orderId: number, createdAt?: string | null): boolean => {
    if (!createdAt) return false
    
    // Check if order has been viewed
    const viewedOrders = JSON.parse(localStorage.getItem('viewed_orders') || '[]')
    if (viewedOrders.includes(orderId)) return false
    
    const orderDate = new Date(createdAt)
    const now = new Date()
    const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24
  }

  // Mark order as viewed
  const markOrderAsViewed = (orderId: number) => {
    const viewedOrders = JSON.parse(localStorage.getItem('viewed_orders') || '[]')
    if (!viewedOrders.includes(orderId)) {
      viewedOrders.push(orderId)
      localStorage.setItem('viewed_orders', JSON.stringify(viewedOrders))
      // Dispatch custom event to notify sidebar
      window.dispatchEvent(new CustomEvent('ordersViewed'))
      // Update state to trigger re-render
      setOrders([...orders])
    }
  }

  // Mark all new orders as viewed when component mounts or orders change
  React.useEffect(() => {
    const now = new Date()
    const viewedOrders = JSON.parse(localStorage.getItem('viewed_orders') || '[]')
    const newViewedOrders = [...viewedOrders]
    let hasChanges = false
    
    orders.forEach(order => {
      if (order.created_at && !viewedOrders.includes(order.id)) {
        const orderDate = new Date(order.created_at)
        const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)
        if (diffInHours <= 24) {
          // Auto-mark as viewed when page is visited
          if (!newViewedOrders.includes(order.id)) {
            newViewedOrders.push(order.id)
            hasChanges = true
          }
        }
      }
    })
    
    if (hasChanges) {
      localStorage.setItem('viewed_orders', JSON.stringify(newViewedOrders))
      // Dispatch custom event to notify sidebar
      window.dispatchEvent(new CustomEvent('ordersViewed'))
    }
  }, [orders])


  // Sort and filter orders
  const sortedOrders = React.useMemo(() => {
    let filtered = [...orders]
    
    // Filter by specific status if selected
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter)
    }
    
    // Sort orders
    if (sortField === 'status') {
      const statusOrder: Record<OrderResource['status'], number> = {
        menunggu_konfirmasi: 1,
        diproses: 2,
        siap_di_pickup: 3,
        selesai: 4,
        dibatalkan: 5,
      }
      filtered.sort((a, b) => {
        const comparison = statusOrder[a.status] - statusOrder[b.status]
        return sortDirection === 'asc' ? comparison : -comparison
      })
    } else if (sortField === 'date') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.delivery_date).getTime()
        const dateB = new Date(b.delivery_date).getTime()
        const comparison = dateA - dateB
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }
    
    return filtered
  }, [orders, sortField, sortDirection, statusFilter])

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Manage B2B Orders</CardDescription>
            </div>
            <div className="flex items-center gap-2"> 
              <Select
                value={
                  statusFilter 
                    ? statusFilter 
                    : sortField 
                      ? `${sortField}-${sortDirection}` 
                      : "none"
                }
                onValueChange={(value) => {
                  if (value === 'none') {
                    setSortField(null)
                    setStatusFilter(null)
                  } else if (value === 'date-asc' || value === 'date-desc') {
                    setSortField('date')
                    setSortDirection(value === 'date-asc' ? 'asc' : 'desc')
                    setStatusFilter(null)

                  } else if (statusOptions.includes(value as OrderResource['status'])) {
                    // Filter by specific status
                    setStatusFilter(value as OrderResource['status'])
                    setSortField(null)
                  }
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">Sort By</SelectItem>
                  <SelectItem value="date-asc">Date (ascending)</SelectItem>
                  <SelectItem value="date-desc">Date (descending)</SelectItem>

                  <SelectItem value="menunggu_konfirmasi">Sort by Pending</SelectItem>
                  <SelectItem value="diproses">Sort by Processing</SelectItem>
                  <SelectItem value="siap_di_pickup">Sort by Ready to Pickup</SelectItem>
                  <SelectItem value="selesai">Sort by Done</SelectItem>
                  <SelectItem value="dibatalkan">Sort by Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {statusFilter 
                        ? `No orders with status "${statusLabels[statusFilter]}"`
                        : orders.length === 0
                          ? "No orders yet"
                          : "No orders match the filter"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedOrders.map((order) => {
                    const isNew = isOrderNew(order.id, order.created_at)
                    return (
                      <TableRow 
                        key={order.id} 
                        className={isNew ? "bg-green-50/50 dark:bg-green-950/10" : ""}
                        onMouseEnter={() => {
                          if (isNew) {
                            markOrderAsViewed(order.id)
                          }
                        }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>#{order.id}</span>
                            {isNew && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300 text-xs">
                                New
                              </Badge>
                            )}
                          </div>
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
                      {/* GANTI BAGIAN TABLE CELL AKSI INI */}
                      <TableCell>
                        {/* Gunakan Flexbox untuk memaksa elemen ke kanan dengan rapi */}
                        <div className="flex items-center justify-end">
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
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })
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
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Enter the reason for order cancellation. This reason will be shown to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
              <Textarea
                id="cancellation-reason"
                placeholder="Example: Insufficient stock, payment issue, etc."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">
                {cancellationReason.length}/500 characters
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
              Cancel
            </Button>
            <Button onClick={handleCancelConfirm} variant="destructive">
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


