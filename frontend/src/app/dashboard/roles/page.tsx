"use client"

import * as React from "react"
import { rolesApi, permissionsApi, usersApi } from "@/lib/api"
import type { RoleResource, PermissionResource, UserResource } from "@/types/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, Edit, Shield, UserPlus, Mail, User, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// ScrollArea component - simple implementation
const ScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-y-auto ${className || ''}`}>{children}</div>
)

export default function RolesPage() {
  // State for Role & Permission CRUD
  const [roles, setRoles] = React.useState<RoleResource[]>([])
  const [permissions, setPermissions] = React.useState<PermissionResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState<RoleResource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    permissions: [] as string[],
  })

  // State for Assign Role to User
  const [userEmail, setUserEmail] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<UserResource | null>(null)
  const [selectedRoleForUser, setSelectedRoleForUser] = React.useState<string>("")
  const [userSuggestions, setUserSuggestions] = React.useState<UserResource[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [searchingUser, setSearchingUser] = React.useState(false)
  const [assigningRole, setAssigningRole] = React.useState(false)
  const [assignedUsers, setAssignedUsers] = React.useState<UserResource[]>([])
  const [editingUserId, setEditingUserId] = React.useState<number | null>(null)
  const [editingRole, setEditingRole] = React.useState<string>("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const suggestionsRef = React.useRef<HTMLDivElement>(null)

  // Fetch roles and permissions
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [rolesData, permissionsData, assignedUsersData] = await Promise.all([
          rolesApi.getAll(),
          permissionsApi.getAll(),
          usersApi.getAll({ per_page: 100 }), // Fetch users dengan role untuk ditampilkan di tabel
        ])
        setRoles(rolesData || [])
        setPermissions(permissionsData || [])
        // Filter users yang sudah punya role (menggunakan Spatie Permission roles)
        const usersWithRoles = (assignedUsersData?.data || []).filter((user) => 
          (user.roles && user.roles.length > 0)
        )
        setAssignedUsers(usersWithRoles)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Debounce search for user suggestions
  React.useEffect(() => {
    if (!userEmail.trim() || userEmail.length < 2) {
      setUserSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await usersApi.getAll({ 
          search: userEmail, 
          per_page: 5 
        })
        
        if (response && response.data) {
          setUserSuggestions(response.data)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error("Error searching users:", error)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [userEmail])

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter roles by search term
  const filteredRoles = React.useMemo(() => {
    if (!searchTerm) return roles
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.permissions.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [roles, searchTerm])

  // Handle create/edit role
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nama role wajib diisi")
      return
    }

    try {
      let result
      if (isEditMode && selectedRole) {
        result = await rolesApi.update(selectedRole.id, formData)
        if (result) {
          toast.success("Role berhasil diperbarui")
          setRoles(roles.map((r) => (r.id === selectedRole.id ? result : r)))
        }
      } else {
        result = await rolesApi.create(formData)
        if (result) {
          toast.success("Role berhasil dibuat")
          setRoles([...roles, result])
        }
      }

      if (result) {
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      toast.error("Gagal menyimpan role")
    }
  }

  // Handle delete role
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus role ini?")) return

    try {
      const success = await rolesApi.delete(id)
      if (success) {
        toast.success("Role berhasil dihapus")
        setRoles(roles.filter((r) => r.id !== id))
      }
    } catch (error) {
      toast.error("Gagal menghapus role")
    }
  }

  // Open edit dialog
  const handleEdit = (role: RoleResource) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      permissions: role.permissions || [],
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  // Open create dialog
  const handleCreate = () => {
    resetForm()
    setIsEditMode(false)
    setSelectedRole(null)
    setIsDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      permissions: [],
    })
  }

  // Toggle permission
  const togglePermission = (permissionName: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter((p) => p !== permissionName)
        : [...prev.permissions, permissionName],
    }))
  }

  // Select user from suggestions
  const handleSelectUser = (user: UserResource) => {
    setSelectedUser(user)
    setUserEmail(user.email)
    setShowSuggestions(false)
    
    // Set current role if exists (menggunakan Spatie Permission roles)
    if (user.roles && user.roles.length > 0) {
      setSelectedRoleForUser(user.roles[0].name)
    }
  }

  // Assign role to user
  const handleAssignRole = async () => {
    if (!selectedUser) {
      toast.error("User belum dipilih")
      return
    }

    if (!selectedRoleForUser) {
      toast.error("Role wajib dipilih")
      return
    }

    setAssigningRole(true)
    try {
      const result = await usersApi.update(selectedUser.id, {
        role: selectedRoleForUser,
      })

      if (result) {
        toast.success("Role berhasil diberikan ke user")
        
        // Update atau add to assigned users list
        setAssignedUsers((prev) => {
          const existingIndex = prev.findIndex((u) => u.id === result.id)
          if (existingIndex >= 0) {
            return prev.map((u, idx) => idx === existingIndex ? result : u)
          } else {
            return [...prev, result]
          }
        })
        
        // Reset form
        setSelectedUser(null)
        setUserEmail("")
        setSelectedRoleForUser("")
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error("Error assigning role:", error)
      toast.error("Gagal memberikan role ke user")
    } finally {
      setAssigningRole(false)
    }
  }

  // Start editing user role
  const handleStartEdit = (user: UserResource) => {
    setEditingUserId(user.id)
    if (user.roles && user.roles.length > 0) {
      setEditingRole(user.roles[0].name)
    } else {
      setEditingRole("")
    }
  }

  // Save edited role
  const handleSaveEdit = async (userId: number) => {
    if (!editingRole) {
      toast.error("Role wajib dipilih")
      return
    }

    try {
      const result = await usersApi.update(userId, {
        role: editingRole,
      })

      if (result) {
        toast.success("Role berhasil diperbarui")
        setAssignedUsers((prev) =>
          prev.map((u) => (u.id === userId ? result : u))
        )
        setEditingUserId(null)
        setEditingRole("")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Gagal memperbarui role")
    }
  }

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditingRole("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role & Permission</h1>
        <p className="text-muted-foreground">
          Kelola role dan permission untuk sistem
        </p>
      </div>

      <Tabs defaultValue="crud" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="crud">CRUD Role & Permission</TabsTrigger>
          <TabsTrigger value="assign">Assign Role to User</TabsTrigger>
        </TabsList>

        {/* Tab 1: CRUD Role & Permission */}
        <TabsContent value="crud" className="space-y-4">
          <div className="flex items-center justify-end">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Role
            </Button>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari role atau permission..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Role</CardTitle>
              <CardDescription>
                {filteredRoles.length} role ditemukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Tidak ada role ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            {role.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.length > 0 ? (
                              role.permissions.slice(0, 3).map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                  {permission}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">Tidak ada</span>
                            )}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3} lainnya
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.status === "Aktif" ? "default" : "secondary"}>
                            {role.status || "Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(role.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Create/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit Role" : "Tambah Role Baru"}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Perbarui informasi role dan permission"
                    : "Buat role baru dan tetapkan permission"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Role</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Contoh: Manager, Staff, dll"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={formData.permissions.includes(permission.name)}
                            onCheckedChange={() => togglePermission(permission.name)}
                          />
                          <Label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSubmit}>
                  {isEditMode ? "Perbarui" : "Buat"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 2: Assign Role to User */}
        <TabsContent value="assign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Berikan Role ke User</CardTitle>
              <CardDescription>
                Cari user berdasarkan email dan berikan role yang sesuai
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Email User</Label>
                <div className="relative">
                  <div className="relative flex-1">
                    <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      ref={inputRef}
                      id="user-email"
                      type="email"
                      placeholder="Ketik email user, contoh: edward@example.com"
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => {
                        if (userSuggestions.length > 0) {
                          setShowSuggestions(true)
                        }
                      }}
                      className="pl-8"
                    />
                  </div>

                  {/* Autocomplete Suggestions Dropdown */}
                  {showSuggestions && userSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                      {userSuggestions.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className={cn(
                            "px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                            selectedUser?.id === user.id && "bg-accent"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.email}</p>
                              <p className="text-xs text-muted-foreground">{user.name}</p>
                            </div>
                            {user.roles && user.roles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {user.roles[0].name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedUser && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      {selectedUser.roles && selectedUser.roles.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {selectedUser.roles.map((role) => (
                            <Badge key={role.id} variant="secondary" className="text-xs">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-select">Pilih Role</Label>
                    <Select
                      value={selectedRoleForUser}
                      onValueChange={setSelectedRoleForUser}
                    >
                      <SelectTrigger id="role-select">
                        <SelectValue placeholder="Pilih role untuk user ini" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleAssignRole}
                    disabled={assigningRole || !selectedRoleForUser}
                    className="w-full"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {assigningRole ? "Memberikan Role..." : "Berikan Role"}
                  </Button>
                </div>
              )}

              {!selectedUser && userEmail && userSuggestions.length === 0 && !searchingUser && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {userEmail.length >= 2 
                      ? "User tidak ditemukan. Pastikan email sudah terdaftar."
                      : "Ketik minimal 2 karakter untuk mencari user"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users dengan Role</CardTitle>
              <CardDescription>
                Daftar user yang sudah diberikan role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada user yang diberikan role
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Select
                              value={editingRole}
                              onValueChange={setEditingRole}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.name}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex gap-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <Badge key={role.id} variant="secondary">
                                    {role.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">Tidak ada</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingUserId === user.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveEdit(user.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
