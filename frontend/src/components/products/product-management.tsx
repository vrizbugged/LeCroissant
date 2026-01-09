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
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const productFormSchema = z.object({
  nama_produk: z.string().min(1, "Nama produk wajib diisi"),
  deskripsi: z.string().min(1, "Deskripsi wajib diisi"),
  harga_grosir: z.number().min(0, "Harga harus lebih dari 0"),
  ketersediaan_stok: z.number().min(0, "Stok harus lebih dari atau sama dengan 0"),
  gambar: z.union([
    z.instanceof(File),
    z.string().url("URL gambar tidak valid"),
    z.literal("")
  ]).optional(),
  status: z.enum(["Aktif", "Non Aktif"]).optional(),
})

interface ProductManagementProps {
  initialProducts: ProductResource[]
}

export function ProductManagement({ initialProducts }: ProductManagementProps) {
  const router = useRouter()
  const [products, setProducts] = React.useState<ProductResource[]>(initialProducts || [])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<ProductResource | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = React.useState<string | null>(null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nama_produk: "",
      deskripsi: "",
      harga_grosir: 0,
      ketersediaan_stok: 0,
      gambar: "",
      status: "Aktif",
    },
  })

  React.useEffect(() => {
    if (editingProduct) {
      const imageUrl = editingProduct.gambar_url || ""
      setOriginalImageUrl(imageUrl)
      form.reset({
        nama_produk: editingProduct.nama_produk || "",
        deskripsi: editingProduct.deskripsi || "",
        harga_grosir: editingProduct.harga_grosir || 0,
        ketersediaan_stok: editingProduct.ketersediaan_stok || 0,
        gambar: imageUrl,
        status: (editingProduct.status as "Aktif" | "Non Aktif") || "Aktif",
      })
    } else {
      setOriginalImageUrl(null)
      form.reset({
        nama_produk: "",
        deskripsi: "",
        harga_grosir: 0,
        ketersediaan_stok: 0,
        gambar: "",
        status: "Aktif",
      })
    }
  }, [editingProduct, form])

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        // Jika gambar tidak berubah (masih URL yang sama), jangan kirim field gambar
        const imageChanged = 
          data.gambar instanceof File || // File baru diupload
          (typeof data.gambar === 'string' && data.gambar && data.gambar !== originalImageUrl) // URL diubah
        
        const dataToSend = { ...data }
        // Hapus field gambar jika tidak berubah (masih URL yang sama atau undefined/empty)
        if (!imageChanged) {
          // Jika gambar adalah string yang sama dengan original, atau undefined/empty, jangan kirim
          delete dataToSend.gambar
        } else {
          // Pastikan gambar dikirim jika berubah
          if (data.gambar instanceof File) {
            dataToSend.gambar = data.gambar
          } else if (typeof data.gambar === 'string' && data.gambar) {
            dataToSend.gambar = data.gambar
          }
        }
        
        const updated = await productsApi.update(editingProduct.id, dataToSend)
        if (updated) {
          setProducts(products.map(p => p.id === editingProduct.id ? updated : p))
          toast.success("Produk berhasil diperbarui")
          setIsDialogOpen(false)
          setEditingProduct(null)
          setOriginalImageUrl(null)
          router.refresh()
        } else {
          toast.error("Gagal memperbarui produk")
        }
      } else {
        const created = await productsApi.create(data)
        if (created) {
          setProducts([...products, created])
          toast.success("Produk berhasil ditambahkan")
          setIsDialogOpen(false)
          setEditingProduct(null)
          setOriginalImageUrl(null)
          router.refresh()
        } else {
          toast.error("Gagal menambahkan produk")
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan"
      toast.error(errorMessage)
      console.error("Error submitting product:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return
    }

    try {
      const success = await productsApi.delete(id)
      if (success) {
        setProducts(products.filter(p => p.id !== id))
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

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusConfig: Record<string, { label: string; className: string }> = {
      Aktif: {
        label: "Aktif",
        className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      },
      "Non Aktif": {
        label: "Non Aktif",
        className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      },
    }

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    }

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
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
                      render={({ field }) => {
                        // Determine initial upload type based on field value
                        const getInitialUploadType = () => {
                          if (field.value instanceof File) return 'file'
                          if (typeof field.value === 'string' && field.value) return 'url'
                          return 'file' // Default to file upload
                        }
                        
                        const [uploadType, setUploadType] = React.useState<'file' | 'url'>(getInitialUploadType())
                        const [preview, setPreview] = React.useState<string | null>(null)
                        const [fileInputKey, setFileInputKey] = React.useState(0)
                        
                        React.useEffect(() => {
                          if (field.value instanceof File) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setPreview(reader.result as string)
                            }
                            reader.readAsDataURL(field.value)
                            setUploadType('file')
                          } else if (typeof field.value === 'string' && field.value) {
                            setPreview(field.value)
                            setUploadType('url')
                          } else {
                            setPreview(null)
                          }
                        }, [field.value])

                        return (
                          <FormItem>
                            <FormLabel>Gambar Produk</FormLabel>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={uploadType === 'file' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    setUploadType('file')
                                    // Reset file input saat beralih ke mode file
                                    setFileInputKey(prev => prev + 1)
                                  }}
                                >
                                  Upload File
                                </Button>
                                <Button
                                  type="button"
                                  variant={uploadType === 'url' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    setUploadType('url')
                                    // Jika ada file, reset ke URL kosong untuk input URL baru
                                    // Jika sudah URL, tetap pertahankan
                                    if (field.value instanceof File) {
                                      field.onChange('')
                                      setPreview(null)
                                    } else if (typeof field.value === 'string' && field.value) {
                                      // Tetap pertahankan URL yang ada
                                      setPreview(field.value)
                                    }
                                    // Reset file input saat beralih ke mode URL
                                    setFileInputKey(prev => prev + 1)
                                  }}
                                >
                                  Gunakan URL
                                </Button>
                              </div>
                              
                              {uploadType === 'file' ? (
                                <FormControl>
                                  <Input
                                    key={`file-input-${fileInputKey}`}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        // Validate file size (max 2MB)
                                        if (file.size > 2 * 1024 * 1024) {
                                          toast.error("Ukuran file maksimal 2MB")
                                          e.target.value = '' // Reset input
                                          return
                                        }
                                        // Validate file type
                                        if (!file.type.startsWith('image/')) {
                                          toast.error("File harus berupa gambar")
                                          e.target.value = '' // Reset input
                                          return
                                        }
                                        // Set file to form state
                                        field.onChange(file)
                                        // Force form to recognize the change
                                        form.setValue('gambar', file, { shouldDirty: true, shouldValidate: true })
                                      } else {
                                        // If no file selected, clear the field
                                        field.onChange('')
                                      }
                                    }}
                                  />
                                </FormControl>
                              ) : (
                                <FormControl>
                                  <Input 
                                    placeholder="https://example.com/image.jpg" 
                                    value={typeof field.value === 'string' ? field.value : ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                  />
                                </FormControl>
                              )}
                              
                              {preview && (
                                <div className="mt-2">
                                  <img 
                                    src={preview} 
                                    alt="Preview" 
                                    className="h-32 w-32 object-cover rounded border"
                                  />
                                </div>
                              )}
                            </div>
                            <FormDescription>
                              {uploadType === 'file' 
                                ? "Upload gambar produk (maksimal 2MB, format: JPG/PNG)"
                                : "Masukkan URL gambar produk"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status produk" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Aktif">Aktif</SelectItem>
                              <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                            </SelectContent>
                          </Select>
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada produk
                    </TableCell>
                  </TableRow>
                ) : (
                  products.filter(product => product && product.id).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={product.gambar_url || product.gambar || ""} alt={product.nama_produk || "Product"} />
                          <AvatarFallback>
                            {(product.nama_produk || "PR").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{product.nama_produk || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.deskripsi || "-"}</TableCell>
                      <TableCell>{formatCurrency(product.harga_grosir || 0)}</TableCell>
                      <TableCell>{product.ketersediaan_stok ?? 0}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
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
                            onClick={() => handleDelete(product.id)}
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

