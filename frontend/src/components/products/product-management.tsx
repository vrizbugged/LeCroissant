"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react"

// Hapus import ProductFormData karena kita akan buat tipe sendiri
import type { ProductResource } from "@/types/api"
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

// 1. Definisikan Schema Validasi
const productFormSchema = z.object({
  nama_produk: z.string().min(1, "Product name is required"),
  deskripsi: z.string().min(1, "Description is required"),
  harga_grosir: z.number().min(0, "Price must be greater than 0"),
  min_order: z.number().min(1, "Minimum order must be greater than 0").optional(),
  // Gambar bisa berupa File (upload baru), String (URL lama), atau kosong
  gambar: z.union([
    z.instanceof(File),
    z.string().optional(),
    z.literal("")
  ]).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
})

// 2. SOLUSI ERROR MERAH: Buat tipe data langsung dari Schema Zod
// Ini menjamin tipe data form 100% cocok dengan validasi
type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductManagementProps {
  initialProducts: ProductResource[]
}

export function ProductManagement({ initialProducts }: ProductManagementProps) {
  const router = useRouter()
  const [products, setProducts] = React.useState<ProductResource[]>(initialProducts || [])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<ProductResource | null>(null)
  
  // 3. Gunakan tipe 'ProductFormValues' (bukan dari API)
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nama_produk: "",
      deskripsi: "",
      harga_grosir: 0,
      min_order: 10,
      gambar: "",
      status: "Active",
    },
  })

  // Reset Form saat Dialog Edit Dibuka
  React.useEffect(() => {
    if (editingProduct) {
      const imageUrl = editingProduct.gambar_url || ""
      
      const statusMap: Record<string, "Active" | "Inactive"> = {
        'Aktif': 'Active',
        'Non Aktif': 'Inactive',
        'Active': 'Active',
        'Inactive': 'Inactive',
      }
      // Kita cast ke any dulu untuk menghindari error ketat TypeScript pada string enum
      const mappedStatus = (statusMap[editingProduct.status || 'Aktif'] || 'Active') as "Active" | "Inactive"
      
      form.reset({
        nama_produk: editingProduct.nama_produk || "",
        deskripsi: editingProduct.deskripsi || "",
        harga_grosir: Number(editingProduct.harga_grosir) || 0,
        min_order: editingProduct.min_order || 10,
        gambar: imageUrl, 
        status: mappedStatus,
      })
    } else {
      form.reset({
        nama_produk: "",
        deskripsi: "",
        harga_grosir: 0,
        min_order: 10,
        gambar: "",
        status: "Active",
      })
    }
  }, [editingProduct, form])

  // Logic Submit
  const handleSubmit = async (data: ProductFormValues) => {
    try {
      if (editingProduct) {
        // === UPDATE ===
        // Kita ubah data form ke format yang API butuhkan (any sementara agar fleksibel)
        const payload: any = {
            nama_produk: data.nama_produk,
            deskripsi: data.deskripsi,
            harga_grosir: data.harga_grosir,
            min_order: data.min_order || 10,
            status: data.status,
            // Logic Gambar
            gambar: (data.gambar instanceof File) ? data.gambar : undefined
        }
        
        const updated = await productsApi.update(editingProduct.id, payload)
        
        if (updated) {
          setProducts(products.map(p => p.id === editingProduct.id ? updated : p))
          toast.success("Product updated successfully")
          setIsDialogOpen(false)
          setEditingProduct(null)
          router.refresh()
        } else {
          toast.error("Failed to update product")
        }

      } else {
        // === CREATE ===
        // Cast ke any agar TypeScript tidak rewel soal perbedaan tipe minor
        const payload: any = { ...data }
        const created = await productsApi.create(payload)
        
        if (created) {
          setProducts([...products, created])
          toast.success("Product added successfully")
          setIsDialogOpen(false)
          setEditingProduct(null)
          router.refresh()
        } else {
          toast.error("Failed to add product")
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      toast.error(errorMessage)
      console.error("Error submitting product:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const success = await productsApi.delete(id)
      if (success) {
        setProducts(products.filter(p => p.id !== id))
        toast.success("Product deleted successfully")
        router.refresh()
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      toast.error("System error occurred")
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
    
    const statusMap: Record<string, { label: string; className: string }> = {
      'Active': { label: "Active", className: "bg-green-100 text-green-800 border-green-300" },
      'Inactive': { label: "Inactive", className: "bg-red-100 text-red-800 border-red-300" },
      'Aktif': { label: "Active", className: "bg-green-100 text-green-800 border-green-300" },
      'Non Aktif': { label: "Inactive", className: "bg-red-100 text-red-800 border-red-300" },
    }

    const config = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800 border-gray-300",
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
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage Le Croissant pastry product catalog</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct
                      ? "Update existing product information"
                      : "Add new pastry product to catalog"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nama_produk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Example: Almond Croissant" {...field} />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Product description" {...field} />
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
                            <FormLabel>Wholesale Price (B2B)</FormLabel>
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
                        name="min_order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Order</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10"
                                {...field}
                                value={field.value ?? 10}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* FIELD GAMBAR */}
                    <FormField
                      control={form.control}
                      name="gambar"
                      render={({ field }) => {
                        // Logic untuk menentukan state awal upload
                        const getInitialUploadType = () => {
                          if (field.value instanceof File) return 'file'
                          if (typeof field.value === 'string' && field.value) return 'url'
                          return 'file'
                        }
                        
                        const [uploadType, setUploadType] = React.useState<'file' | 'url'>(getInitialUploadType())
                        const [preview, setPreview] = React.useState<string | null>(null)
                        const [fileInputKey, setFileInputKey] = React.useState(0)
                        
                        React.useEffect(() => {
                          if (field.value instanceof File) {
                            const reader = new FileReader()
                            reader.onloadend = () => setPreview(reader.result as string)
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
                            <FormLabel>Product Image</FormLabel>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={uploadType === 'file' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    setUploadType('file')
                                    setFileInputKey(p => p + 1)
                                  }}
                                >
                                  Upload File
                                </Button>
                                {/* Tombol URL Opsional */}
                                <Button
                                  type="button"
                                  variant={uploadType === 'url' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    setUploadType('url')
                                    if (field.value instanceof File) {
                                      field.onChange('')
                                      setPreview(null)
                                    }
                                  }}
                                >
                                  Use URL
                                </Button>
                              </div>
                              
                              {uploadType === 'file' ? (
                                <FormControl>
                                  <Input
                                    key={`file-input-${fileInputKey}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        if (file.size > 2 * 1024 * 1024) {
                                          toast.error("Maximum 2MB")
                                          e.target.value = ''
                                          return
                                        }
                                        field.onChange(file)
                                        // PENTING: Trigger validation agar form dirty
                                        form.setValue('gambar', file, { shouldDirty: true, shouldValidate: true })
                                      }
                                    }}
                                  />
                                </FormControl>
                              ) : (
                                <FormControl>
                                  <Input 
                                    placeholder="https://..." 
                                    value={typeof field.value === 'string' ? field.value : ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                  />
                                </FormControl>
                              )}
                              
                              {preview && (
                                <div className="mt-2">
                                  <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded border" />
                                </div>
                              )}
                            </div>
                            <FormDescription>
                                {uploadType === 'file' ? "Format: JPG/PNG, Max 2MB" : "External Image URL"}
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
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
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
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingProduct ? "Update" : "Add"}
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
                  <TableHead>Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Wholesale Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products yet
                    </TableCell>
                  </TableRow>
                ) : (
                  products.filter(p => p && p.id).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Avatar className="h-12 w-12 rounded-md">
                          <AvatarImage 
                            src={product.gambar_url || product.gambar || ""} 
                            alt={product.nama_produk} 
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-md">
                            {(product.nama_produk || "PR").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{product.nama_produk}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.deskripsi}</TableCell>
                      <TableCell>{formatCurrency(product.harga_grosir || 0)}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {/* <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                            <TrashIcon className="h-4 w-4" />
                          </Button> */}
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