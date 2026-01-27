"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CheckCircle2Icon, PencilIcon, PlusIcon, TrashIcon, MoreVertical, ChevronDown, ChevronRight, Phone, MapPin, Calendar1, CalendarArrowUp } from "lucide-react"

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
// --- TAMBAHAN IMPORT SELECT ---
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// --- UPDATE SCHEMA ---
const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone_number: z.string().optional(),
  company_name: z.string().optional(),
  business_sector: z.string().optional(),
  address: z.string().optional(),
  // Field status WAJIB ada agar lolos validasi dan dikirim ke backend
  status: z.string().min(1, "Status must be selected"), 
})

interface ClientManagementProps {
  initialClients: ClientResource[]
}

export function ClientManagement({ initialClients }: ClientManagementProps) {
  const router = useRouter()
  const [clients, setClients] = React.useState<ClientResource[]>(initialClients || [])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<ClientResource | null>(null)
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set())

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      company_name: "",
      business_sector: "",
      address: "",
      status: "Pending", // Default value untuk klien baru
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
        address: editingClient.address || "",
        status: editingClient.status || "Pending",
      })
    } else {
      form.reset({
        name: "",
        email: "",
        phone_number: "",
        company_name: "",
        business_sector: "",
        address: "",
        status: "Pending",
      })
    }
  }, [editingClient, form])

  const handleSubmit = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        const updated = await clientsApi.update(editingClient.id, data)
        if (updated) {
          setClients(clients.map(c => c.id === editingClient.id ? updated : c))
          toast.success("Client data updated successfully")
        } else {
          toast.error("Failed to update client data")
        }
      } else {
        const created = await clientsApi.create(data)
        if (created) {
          setClients([...clients, created])
          toast.success("Client added successfully")
        } else {
          toast.error("Failed to add client")
        }
      }
      setIsDialogOpen(false)
      setEditingClient(null)
      router.refresh()
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return
    }

    try {
      const success = await clientsApi.delete(id)
      if (success) {
        setClients(clients.filter(c => c.id !== id))
        toast.success("Client deleted successfully")
        router.refresh()
      } else {
        toast.error("Failed to delete client")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    }
  }

  const handleVerify = async (id: number) => {
    try {
      const verified = await clientsApi.verify(id)
      if (verified) {
        setClients(clients.map(c => c.id === id ? verified : c))
        toast.success("Client account verified successfully")
        router.refresh()
      } else {
        toast.error("Failed to verify client")
      }
    } catch (error) {
      toast.error("An error occurred")
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

  const toggleRow = (clientId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(clientId)) {
        newSet.delete(clientId)
      } else {
        newSet.add(clientId)
      }
      return newSet
    })
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusConfig: Record<string, { label: string; className: string }> = {
      Pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      },
      Aktif: {
        label: "Active",
        className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      },
      "Non Aktif": {
        label: "Inactive",
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
              <CardTitle>Client Management</CardTitle>
              <CardDescription>Manage client data and verify account</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingClient ? "Edit Client" : "Add New Client"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingClient
                      ? "Update client information"
                      : "Add new client to system"}
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
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Name" {...field} />
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
                          <FormLabel>Phone Number</FormLabel>
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
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="business_sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Sector</FormLabel>
                          <FormControl>
                              {/* Bisa diganti Select jika mau fix option */}
                              <Input placeholder="Hotel, Restaurant, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* --- INPUT STATUS (PENTING) --- */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* ------------------------------- */}

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingClient(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingClient ? "Update" : "Add"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* ... (Tabel tetap sama) ... */}
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Business Sector</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No Data Client
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => {
                    const isExpanded = expandedRows.has(client.id)
                    return (
                      <React.Fragment key={client.id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleRow(client.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
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
                                <DropdownMenuLabel>Action</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(client)}>
                                  <PencilIcon className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {client.status === "Pending" && (
                                  <DropdownMenuItem onClick={() => handleVerify(client.id)}>
                                    <CheckCircle2Icon className="mr-2 h-4 w-4" />
                                    Verify
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(client.id)}
                                  className="text-red-600"
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/30 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Nomor Telepon */}
                                {client.phone_number && (
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white-500/10 flex-shrink-0 mt-0.5">
                                      <Phone className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm mb-0.5">Phone Number</p>
                                      <p className="text-sm text-muted-foreground">
                                        {client.phone_number}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Alamat */}
                                {client.address && (
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white-500/10 flex-shrink-0 mt-0.5">
                                      <MapPin className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm mb-0.5">Address</p>
                                      <p className="text-sm text-muted-foreground">
                                        {client.address}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* ID Klien */}
                                <div className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white-500/10 flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-gray-600">ID</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm mb-0.5">Client ID</p>
                                    <p className="text-sm text-muted-foreground">
                                      #{client.id}
                                    </p>
                                  </div>
                                </div>

                                {/* Tanggal Dibuat */}
                                {client.created_at && (
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white-500/10 flex-shrink-0 mt-0.5">
                                      <Calendar1 className="h-4 w-4 text-gray-600" /> 
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm mb-0.5">Date Created</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(client.created_at).toLocaleDateString('id-ID', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Tanggal Diperbarui */}
                                {client.updated_at && (
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white-500/10 flex-shrink-0 mt-0.5">
                                      <CalendarArrowUp className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm mb-0.5">Last Updated</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(client.updated_at).toLocaleDateString('id-ID', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                )}
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
    </div>
  )
}