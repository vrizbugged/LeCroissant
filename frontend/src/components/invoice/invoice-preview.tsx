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

// --- CONSTANTS ---
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

// --- MAIN COMPONENT ---
interface InvoicePreviewProps {
  order: OrderResource | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicePreview({ order, open, onOpenChange }: InvoicePreviewProps) {
  const handlePrint = React.useCallback(() => {
    window.print()
  }, [])

  if (!order) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* 1. TAMPILAN MODAL (Normal di layar, Hilang saat print) */}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Invoice Preview - Order #{order?.id || ''}</DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <InvoiceInnerContent order={order} />
            
            <div className="flex gap-3 justify-end mt-8 border-t pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Tutup
              </Button>
              {order.status !== 'dibatalkan' && (
                <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. TAMPILAN CETAK (Khusus Print, di luar Modal) */}
      {/* Kita gunakan ID 'print-area' untuk ditarget CSS khusus */}
      {open && (
        <div id="print-area" className="hidden">
          <InvoiceInnerContent order={order} isPrintMode />
        </div>
      )}

      {/* 3. CSS "PENYELAMAT" (Visibility Strategy) */}
      <style jsx global>{`
        @media print {
          /* Sembunyikan semua elemen body dengan visibility (bukan display) */
          body * {
            visibility: hidden;
          }

          /* Munculkan kembali HANYA area print */
          #print-area, #print-area * {
            visibility: visible;
          }

          /* Posisikan area print di pojok kiri atas mutlak */
          #print-area {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            z-index: 9999 !important;
            background-color: white !important;
            padding: 20px !important;
            margin: 0 !important;
          }

          /* Reset margin browser */
          @page {
            margin: 0;
            size: auto;
          }

          /* Fix scrollbar */
          html, body {
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>
    </>
  )
}

// --- SUB COMPONENT (Isi Invoice) ---
function InvoiceInnerContent({ order, isPrintMode = false }: { order: OrderResource, isPrintMode?: boolean }) {
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

  const StatusIcon = statusIcons[order.status]
  const client = order.client || order.user

  return (
    <div className={`invoice-layout text-sm md:text-base ${isPrintMode ? 'text-black' : ''}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            {/* Gunakan unoptimized agar gambar muncul saat print */}
            <Image
              src="/image/lecroissant.png"
              alt="Le Croissant Logo"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Freshly baked every day</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Status Box */}
        <div className={`rounded-lg p-4 border ${isPrintMode ? 'border-gray-300' : 'bg-muted/50 border-transparent'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              <span className="font-semibold">Status:</span>
            </div>
            <Badge className={`${statusColors[order.status]} border-0 print:border print:border-gray-300`}>
              {statusLabels[order.status]}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Transaksi:</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal:</span>
              <span className="font-medium">{formatDate(order.created_at)}</span>
            </div>
            {order.delivery_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengiriman:</span>
                <span className="font-medium">{formatDate(order.delivery_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Client Box */}
        {client && (
          <div className={`rounded-lg p-4 border ${isPrintMode ? 'border-gray-300' : 'bg-muted/50 border-transparent'}`}>
            <h3 className="font-semibold mb-3">Informasi Klien</h3>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Nama</span>
                <span className="font-medium">{client.name}</span>
              </div>
              {client.email && (
                <div className="flex flex-col">
                   <span className="text-muted-foreground text-xs">Email</span>
                   <span>{client.email}</span>
                </div>
              )}
              {client.phone_number && (
                <div className="flex flex-col">
                   <span className="text-muted-foreground text-xs">Telepon</span>
                   <span>{client.phone_number}</span>
                </div>
              )}
              {client.address && (
                <div className="flex flex-col">
                   <span className="text-muted-foreground text-xs">Alamat</span>
                   <span>{client.address}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Table */}
      {order.products && order.products.length > 0 && (
        <div className={`mb-8 border rounded-lg overflow-hidden ${isPrintMode ? 'border-gray-300' : ''}`}>
          <Table>
            <TableHeader>
              <TableRow className={isPrintMode ? 'border-gray-300' : ''}>
                <TableHead>Produk</TableHead>
                <TableHead className="text-center">Jml</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.products.map((product) => (
                <TableRow key={product.id} className={isPrintMode ? 'border-gray-300' : ''}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    {product.description && !isPrintMode && (
                      <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{product.pivot.quantity}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatCurrency(product.pivot.price_at_purchase)}</TableCell>
                  <TableCell className="text-right font-medium whitespace-nowrap">
                    {formatCurrency(product.pivot.quantity * product.pivot.price_at_purchase)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Notes & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {order.special_notes && (
            <div className={`rounded-lg p-4 border ${isPrintMode ? 'border-gray-300' : 'bg-muted/50 border-transparent'}`}>
              <h3 className="font-semibold mb-2">Catatan</h3>
              <p className="text-sm">{order.special_notes}</p>
            </div>
          )}
        </div>
        
        <div className={`rounded-lg p-4 border ${isPrintMode ? 'border-gray-300' : 'bg-muted/50 border-transparent'}`}>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Item:</span>
              <span>{order.products?.reduce((sum, p) => sum + p.pivot.quantity, 0) || 0} unit</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-orange-600 print:text-black">
                {formatCurrency(order.total_price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}