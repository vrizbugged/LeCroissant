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
import { Eye, FileText, Image as ImageIcon, Download, FileDown, ChevronDown, ChevronRight, Package, StickyNote } from "lucide-react"

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

const getOrderStatusLabel = (order: OrderResource): string => {
  if (order.status === 'selesai' && order.completed_by === 'admin' && !order.client_picked_up_at) {
    return 'Done (Awaiting Client Confirm)'
  }
  if (order.status === 'selesai' && order.completed_by === 'system') {
    return 'Done (Auto)'
  }
  return statusLabels[order.status]
}

interface OrderManagementProps {
  initialOrders: OrderResource[]
}

type SortField = 'status' | 'date' | OrderResource['status'] | null
type SortDirection = 'asc' | 'desc'

export function OrderManagement({ initialOrders }: OrderManagementProps) {
  const router = useRouter()
  const [orders, setOrders] = React.useState<OrderResource[]>(initialOrders || [])
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set())
  const [sortField, setSortField] = React.useState<SortField>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = React.useState<OrderResource['status'] | null>(null)
  const [cancelDialog, setCancelDialog] = React.useState<{
    open: boolean
    orderId: number | null
  }>({ open: false, orderId: null })
  const [cancellationReason, setCancellationReason] = React.useState("")
  const [paymentProofDialog, setPaymentProofDialog] = React.useState<{
    open: boolean
    order: OrderResource | null
  }>({ open: false, order: null })

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

  const toggleRow = (orderId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  const getOrderItems = (order: OrderResource) => {
    if (order.products && order.products.length > 0) {
      return order.products.map((product) => ({
        name: product.name,
        quantity: product.pivot?.quantity ?? 0,
        unitPrice: product.pivot?.price_at_purchase ?? product.price_b2b ?? 0,
        subtotal:
          (product.pivot?.quantity ?? 0) *
          (product.pivot?.price_at_purchase ?? product.price_b2b ?? 0),
      }))
    }

    const rawItems = (order as unknown as { items?: Array<{ product_name?: string; quantity?: number; price_at_purchase?: number; subtotal?: number }> }).items
    if (rawItems && rawItems.length > 0) {
      return rawItems.map((item) => ({
        name: item.product_name || "Produk",
        quantity: item.quantity ?? 0,
        unitPrice: item.price_at_purchase ?? 0,
        subtotal: item.subtotal ?? (item.quantity ?? 0) * (item.price_at_purchase ?? 0),
      }))
    }

    return []
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

  // Handle export to Excel (.xlsx)
  const handleExport = async () => {
    try {
      await ordersApi.exportExcel({
        status: statusFilter || undefined,
      })
      toast.success("Orders report exported successfully (.xlsx)")
    } catch (error) {
      console.error("Error exporting orders:", error)
      toast.error("Failed to export orders report")
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Manage B2B Orders</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"> 
              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full gap-2 sm:w-auto"
              >
                <FileDown className="h-4 w-4" />
                Export Report
              </Button>
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
                <SelectTrigger className="w-full sm:w-[220px]">
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
                  <TableHead className="w-12"></TableHead>
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                    const isExpanded = expandedRows.has(order.id)
                    const orderItems = getOrderItems(order)
                    const clientNote =
                      order.special_notes ||
                      (order as unknown as { notes?: string | null }).notes ||
                      "-"
                    return (
                      <React.Fragment key={order.id}>
                        <TableRow
                          className={isNew ? "bg-green-50/50 dark:bg-green-950/10" : ""}
                          onMouseEnter={() => {
                            if (isNew) {
                              markOrderAsViewed(order.id)
                            }
                          }}
                        >
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleRow(order.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
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
                              {getOrderStatusLabel(order)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {order.payment_proof_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPaymentProofDialog({ open: true, order })}
                                  className="h-8"
                                  title="View Payment Proof"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
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

                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-muted/30 p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    Ordered Items
                                  </div>
                                  {orderItems.length > 0 ? (
                                    <div className="space-y-2">
                                      {orderItems.map((item, idx) => (
                                        <div key={`${order.id}-item-${idx}`} className="rounded-md border bg-background p-3">
                                          <p className="font-medium">{item.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Qty {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.subtotal)}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No item details available.</p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-semibold">
                                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                                    Client Note
                                  </div>
                                  <div className="rounded-md border bg-background p-3">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{clientNote}</p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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

      {/* Payment Proof Dialog */}
      <Dialog 
        open={paymentProofDialog.open} 
        onOpenChange={(open) => {
          setPaymentProofDialog({ open, order: open ? paymentProofDialog.order : null })
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Payment Proof - Order #{paymentProofDialog.order?.id}</DialogTitle>
            <DialogDescription>
              View payment proof uploaded by client for order validation
            </DialogDescription>
          </DialogHeader>
          {paymentProofDialog.order?.payment_proof_url ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {paymentProofDialog.order.payment_proof_url.toLowerCase().includes('.pdf') || 
                   paymentProofDialog.order.payment_proof_url.toLowerCase().includes('application/pdf') ? (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {paymentProofDialog.order.payment_proof_url.toLowerCase().includes('.pdf') || 
                     paymentProofDialog.order.payment_proof_url.toLowerCase().includes('application/pdf')
                      ? 'PDF Document' 
                      : 'Image File'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (paymentProofDialog.order?.payment_proof_url) {
                      window.open(paymentProofDialog.order.payment_proof_url, '_blank')
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {paymentProofDialog.order.payment_proof_url.toLowerCase().includes('.pdf') || 
                 paymentProofDialog.order.payment_proof_url.toLowerCase().includes('application/pdf') ? (
                  <div className="w-full h-[600px]">
                    <iframe
                      src={paymentProofDialog.order.payment_proof_url}
                      className="w-full h-full border-0"
                      title="Payment Proof PDF"
                    />
                  </div>
                ) : (
                  <div className="relative w-full min-h-[400px] max-h-[600px] flex items-center justify-center bg-muted p-4">
                    <img
                      src={paymentProofDialog.order.payment_proof_url}
                      alt={`Payment proof for order #${paymentProofDialog.order.id}`}
                      className="max-w-full max-h-[600px] object-contain rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent && !parent.querySelector('.error-message')) {
                          const errorDiv = document.createElement('div')
                          errorDiv.className = 'error-message flex flex-col items-center justify-center h-full p-8 text-center'
                          errorDiv.innerHTML = `
                            <svg class="h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p class="text-muted-foreground">Failed to load payment proof image</p>
                            <button 
                              class="mt-4 px-4 py-2 text-sm border rounded-md hover:bg-accent"
                              onclick="window.open('${paymentProofDialog.order?.payment_proof_url || ''}', '_blank')"
                            >
                              Open in New Tab
                            </button>
                          `
                          parent.appendChild(errorDiv)
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Order ID:</strong> #{paymentProofDialog.order.id}</p>
                <p><strong>Client:</strong> {paymentProofDialog.order.client?.name || paymentProofDialog.order.user?.name || 'N/A'}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(paymentProofDialog.order.total_price)}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No payment proof available for this order</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


