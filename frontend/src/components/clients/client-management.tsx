"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CheckCircle2Icon, PencilIcon, PlusIcon, TrashIcon, MoreVertical } from "lucide-react"

import type { ClientResource, ClientFormData } from "@/types/api"
import { clientsApi } from "@/lib/api"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const clientFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone_number: z.string().optional(),
  company_name: z.string().optional(),
  business_sector: z.string().optional(),
  citizenship: z.string().optional(),
  address: z.string().optional(),
})

interface ClientManagementProps {
  initialClients: ClientResource[]
}

export function ClientManagement({ initialClients }: ClientManagementProps) {
  const router = useRouter()
  const [clients, setClients] = React.useState<ClientResource[]>(initialClients || [])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<ClientResource | null>(null)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      company_name: "",
      business_sector: "",
      citizenship: "",
      address: "",
    },
  })

  React.useEffect(() => {
    if (editingClient) {
      form.reset({
        name: editingClient.name,
        email: editingClient.email,
        phone_number: editingClient.phone_number || "",
        company_name: editingClient.company_name || "",
        business_sector: editingClient.business_sector || "",
        citizenship: editingClient.citizenship || "",
        address: editingClient.address || "",
      })
    } else {
      form.reset({
        name: "",
        email: "",
        phone_number: "",
        company_name: "",
        business_sector: "",
        citizenship: "",
        address: "",
      })
    }
  }, [editingClient, form])

  const handleSubmit = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        const updated = await clientsApi.update(editingClient.id, data)
        if (updated) {
          setClients(clients.map(c => c.id === editingClient.id ? updated : c))
          toast.success("Data klien berhasil diperbarui")
        } else {
          toast.error("Gagal memperbarui data klien")
        }
      } else {
        const created = await clientsApi.create(data)
        if (created) {
          setClients([...clients, created])
          toast.success("Klien berhasil ditambahkan")
        } else {
          toast.error("Gagal menambahkan klien")
        }
      }
      setIsDialogOpen(false)
      setEditingClient(null)
      router.refresh()
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus klien ini?")) {
      return
    }

    try {
      const success = await clientsApi.delete(id)
      if (success) {
        setClients(clients.filter(c => c.id !== id))
        toast.success("Klien berhasil dihapus")
        router.refresh()
      } else {
        toast.error("Gagal menghapus klien")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    }
  }

  const handleVerify = async (id: number) => {
    try {
      const verified = await clientsApi.verify(id)
      if (verified) {
        setClients(clients.map(c => c.id === id ? verified : c))
        toast.success("Akun klien berhasil diverifikasi")
        router.refresh()
      } else {
        toast.error("Gagal memverifikasi klien")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    }
  }

  const handleEdit = (client: ClientResource) => {
    setEditingClient(client)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingClient(null)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusConfig: Record<string, { label: string; className: string }> = {
      Pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      },
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
              <CardTitle>Manajemen Data Klien B2B</CardTitle>
              <CardDescription>Kelola data klien dan verifikasi akun</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Tambah Klien
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingClient ? "Edit Klien" : "Tambah Klien Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingClient
                      ? "Perbarui informasi klien"
                      : "Tambahkan klien baru ke sistem"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama lengkap" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon</FormLabel>
                          <FormControl>
                            <Input placeholder="081234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Perusahaan</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama perusahaan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="business_sector"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sektor Bisnis</FormLabel>
                            <FormControl>
                              <Input placeholder="Hotel, Restoran, dll" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="citizenship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kewarganegaraan</FormLabel>
                            <FormControl>
                              <Input placeholder="WNI / WNA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat</FormLabel>
                          <FormControl>
                            <Input placeholder="Alamat lengkap" {...field} />
                          </FormControl>
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
                          setEditingClient(null)
                        }}
                      >
                        Batal
                      </Button>
                      <Button type="submit">
                        {editingClient ? "Perbarui" : "Tambah"}
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
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Sektor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Pesanan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada data klien
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.company_name || "-"}</TableCell>
                      <TableCell>{client.business_sector || "-"}</TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>{client.total_orders_count || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                              <PencilIcon className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {client.status === "Pending" && (
                              <DropdownMenuItem onClick={() => handleVerify(client.id)}>
                                <CheckCircle2Icon className="mr-2 h-4 w-4" />
                                Verifikasi
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600"
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

