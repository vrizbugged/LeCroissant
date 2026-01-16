"use client"

import * as React from "react"
import Image from "next/image"
import type { OrderResource } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Printer, X, CheckCircle2, Clock, Package, Truck } from "lucide-react"

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

const statusIcons: Record<OrderResource['status'], typeof CheckCircle2> = {
  menunggu_konfirmasi: Clock,
  diproses: Package,
  siap_di_pickup: Truck,
  selesai: CheckCircle2,
  dibatalkan: X,
}

interface InvoicePreviewProps {
  order: OrderResource | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicePreview({ order, open, onOpenChange }: InvoicePreviewProps) {
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
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const timeStr = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateStr}, ${timeStr}`
  }

  const handlePrint = React.useCallback(() => {
    // Trigger print dialog
    window.print()
  }, [])

  if (!order) return null

  const StatusIcon = statusIcons[order.status]
  const client = order.client || order.user

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
          <DialogHeader className="sr-only">
            <DialogTitle>Invoice Preview - Order #{order?.id || ''}</DialogTitle>
          </DialogHeader>
          <div className="invoice-content print:p-[1cm]">
            {/* Header */}
            <div className="text-center mb-6 print:mb-2">
              <div className="flex justify-center mb-2 print:mb-1">
                <div className="relative w-32 h-32 md:w-40 md:h-40 print:w-20 print:h-20">
                  <Image
                    src="/image/lecroissant.png"
                    alt="Le Croissant Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground print:text-[10pt]">
                Freshly baked every day
              </p>
            </div>

            {/* Status & Client Information - Side by side on print */}
            <div className="grid grid-cols-1 print:grid-cols-2 gap-4 mb-6 print:mb-2">
              {/* Status & Transaction Details */}
              <div className="bg-muted/50 rounded-lg p-4 print:bg-transparent print:border print:border-gray-300 print:p-2">
                <div className="flex items-center justify-between mb-4 print:mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-5 w-5 print:h-4 print:w-4" />
                    <span className="font-semibold print:text-[10pt]">Status:</span>
                  </div>
                  <Badge className={`${statusColors[order.status]} print:text-[9pt] print:px-1 print:py-0`}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm print:text-[10pt] print:space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Transaksi:</span>
                    <span className="font-medium">#{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal:</span>
                    <span className="font-medium">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waktu:</span>
                    <span className="font-medium">
                      {new Date(order.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {order.delivery_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Pengiriman:</span>
                      <span className="font-medium">{formatDate(order.delivery_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information */}
              {client && (
                <div className="print:mb-0">
                  <h3 className="font-semibold mb-3 print:text-[10pt] print:mb-1">Informasi Klien</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm print:bg-transparent print:border print:border-gray-300 print:text-[10pt] print:p-2 print:space-y-1">
                    <div>
                      <span className="text-muted-foreground">Nama:</span>
                      <span className="ml-2 font-medium">{client.name}</span>
                    </div>
                    {client.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 font-medium">{client.email}</span>
                      </div>
                    )}
                    {client.phone_number && (
                      <div>
                        <span className="text-muted-foreground">Telepon:</span>
                        <span className="ml-2 font-medium">{client.phone_number}</span>
                      </div>
                    )}
                    {client.address && (
                      <div>
                        <span className="text-muted-foreground">Alamat:</span>
                        <span className="ml-2 font-medium">{client.address}</span>
                      </div>
                    )}
                    {('company_name' in client && client.company_name) && (
                      <div>
                        <span className="text-muted-foreground">Perusahaan:</span>
                        <span className="ml-2 font-medium">{client.company_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            {order.products && order.products.length > 0 && (
              <div className="mb-6 print:mb-2">
                <h3 className="font-semibold mb-3 print:text-[10pt] print:mb-1">Detail Produk</h3>
                <div className="border rounded-lg overflow-hidden print:border-gray-300">
                  <Table>
                    <TableHeader>
                      <TableRow className="print:border-gray-300">
                        <TableHead className="print:text-black print:text-[10pt] print:py-1">Produk</TableHead>
                        <TableHead className="text-center print:text-black print:text-[10pt] print:py-1">Jumlah</TableHead>
                        <TableHead className="text-right print:text-black print:text-[10pt] print:py-1">Harga Satuan</TableHead>
                        <TableHead className="text-right print:text-black print:text-[10pt] print:py-1">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.products.map((product) => (
                        <TableRow key={product.id} className="print:border-gray-300 print:py-1">
                          <TableCell className="print:text-black print:text-[10pt]">
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded print:hidden"
                                />
                              )}
                              <div>
                                <div className="font-medium print:text-[10pt]">{product.name}</div>
                                {product.description && (
                                  <div className="text-sm text-muted-foreground print:text-gray-600 print:text-[9pt] print:hidden">
                                    {product.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center print:text-black print:text-[10pt]">
                            {product.pivot.quantity}
                          </TableCell>
                          <TableCell className="text-right print:text-black print:text-[10pt]">
                            {formatCurrency(product.pivot.price_at_purchase)}
                          </TableCell>
                          <TableCell className="text-right font-medium print:text-black print:text-[10pt]">
                            {formatCurrency(
                              product.pivot.quantity * product.pivot.price_at_purchase
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Special Notes */}
            {order.special_notes && (
              <div className="mb-6 print:mb-2">
                <h3 className="font-semibold mb-2 print:text-[10pt] print:mb-1">Catatan Khusus</h3>
                <div className="bg-muted/50 rounded-lg p-4 text-sm print:bg-transparent print:border print:border-gray-300 print:text-[10pt] print:p-2">
                  {order.special_notes}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6 print:mb-0 print:bg-transparent print:border print:border-gray-300 print:p-2">
              <h3 className="font-semibold mb-3 print:text-[10pt] print:mb-1">Ringkasan</h3>
              <div className="space-y-2 text-sm print:text-[10pt] print:space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah Item:</span>
                  <span className="font-medium">
                    {order.products?.reduce((sum, p) => sum + p.pivot.quantity, 0) || 0} unit
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold print:text-[12pt]">
                  <span>Total Harga:</span>
                  <span className="text-orange-600 print:text-black">
                    {formatCurrency(order.total_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Admin:</span>
                  <span className="font-medium text-green-600 print:text-black">Gratis!</span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Hidden on print */}
            <div className="flex gap-3 justify-end print:hidden">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Tutup
              </Button>
              <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700">
                <Printer className="h-4 w-4 mr-2" />
                Cetak
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .invoice-content,
            .invoice-content * {
              visibility: visible;
            }
            .invoice-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            @page {
              margin: 5mm;
              size: A4;
            }
            .print\\:hidden {
              display: none !important;
            }
            .invoice-content table {
              font-size: 10pt;
            }
            .invoice-content th,
            .invoice-content td {
              padding: 4px 8px;
            }
          }
        `
      }} />
    </>
  )
}
