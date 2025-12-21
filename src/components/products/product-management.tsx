"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react"

import type { ProductResource, ProductFormData } from "@/types/api"
import { productsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const productFormSchema = z.object({
  nama_produk: z.string().min(1, "Nama produk wajib diisi"),
  deskripsi: z.string().min(1, "Deskripsi wajib diisi"),
  harga_grosir: z.number().min(0, "Harga harus lebih dari 0"),
  ketersediaan_stok: z.number().min(0, "Stok harus lebih dari atau sama dengan 0"),
  gambar: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
})

interface ProductManagementProps {
  initialProducts: ProductResource[]
}

export function ProductManagement({ initialProducts }: ProductManagementProps) {
  const router = useRouter()
  const [products, setProducts] = React.useState<ProductResource[]>(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<ProductResource | null>(null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nama_produk: "",
      deskripsi: "",
      harga_grosir: 0,
      ketersediaan_stok: 0,
      gambar: "",
    },
  })

  React.useEffect(() => {
    if (editingProduct) {
      form.reset({
        nama_produk: editingProduct.nama_produk,
        deskripsi: editingProduct.deskripsi,
        harga_grosir: editingProduct.harga_grosir,
        ketersediaan_stok: editingProduct.ketersediaan_stok,
        gambar: editingProduct.gambar || "",
      })
    } else {
      form.reset({
        nama_produk: "",
        deskripsi: "",
        harga_grosir: 0,
        ketersediaan_stok: 0,
        gambar: "",
      })
    }
  }, [editingProduct, form])

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        const updated = await productsApi.update(editingProduct.id_produk, data)
        if (updated) {
          setProducts(products.map(p => p.id_produk === editingProduct.id_produk ? updated : p))
          toast.success("Produk berhasil diperbarui")
        } else {
          toast.error("Gagal memperbarui produk")
        }
      } else {
        const created = await productsApi.create(data)
        if (created) {
          setProducts([...products, created])
          toast.success("Produk berhasil ditambahkan")
        } else {
          toast.error("Gagal menambahkan produk")
        }
      }
      setIsDialogOpen(false)
      setEditingProduct(null)
      router.refresh()
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return
    }

    try {
      const success = await productsApi.delete(id)
      if (success) {
        setProducts(products.filter(p => p.id_produk !== id))
        toast.success("Produk berhasil dihapus")
        router.refresh()
      } else {
        toast.error("Gagal menghapus produk")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    }
  }

  const handleEdit = (product: ProductResource) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manajemen Produk</CardTitle>
              <CardDescription>Kelola katalog produk pastry Le Croissant</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Tambah Produk
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct
                      ? "Perbarui informasi produk"
                      : "Tambahkan produk baru ke katalog"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nama_produk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Produk</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Croissant Almond" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deskripsi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi</FormLabel>
                          <FormControl>
                            <Input placeholder="Deskripsi produk" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="harga_grosir"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Harga Grosir (B2B)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ketersediaan_stok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stok</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="gambar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Gambar</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            Masukkan URL gambar produk
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingProduct(null)
                        }}
                      >
                        Batal
                      </Button>
                      <Button type="submit">
                        {editingProduct ? "Perbarui" : "Tambah"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Harga Grosir</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada produk
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id_produk}>
                      <TableCell>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={product.gambar} alt={product.nama_produk} />
                          <AvatarFallback>
                            {product.nama_produk.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{product.nama_produk}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.deskripsi}</TableCell>
                      <TableCell>{formatCurrency(product.harga_grosir)}</TableCell>
                      <TableCell>{product.ketersediaan_stok}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id_produk)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

