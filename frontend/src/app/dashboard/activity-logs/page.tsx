"use client"

import * as React from "react"
import { activityLogsApi } from "@/lib/api"
import type { ActivityLogResource, ActivityLogListParams } from "@/types/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Download, Calendar, User, FileText, Eye } from "lucide-react"
import { toast } from "sonner"
// Simple date formatter
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateString
  }
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = React.useState<ActivityLogResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  })
  const [filters, setFilters] = React.useState<ActivityLogListParams>({
    per_page: 15,
    page: 1,
  })
  const [selectedLog, setSelectedLog] = React.useState<ActivityLogResource | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false)

  // Fetch activity logs
  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await activityLogsApi.getLogs(filters)
      if (response) {
        const logsData = response.data || []
        setLogs(logsData)
        if (response.meta) {
          setPagination(response.meta)
        }
        // Debug: Check if changes are present
        if (logsData.length > 0 && logsData[0].changes) {
          console.log("Activity log changes detected:", logsData[0].changes)
        }
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error)
      toast.error("Gagal memuat activity logs")
    } finally {
      setLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Handle filter change
  const handleFilterChange = (key: keyof ActivityLogListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }))
  }

  // Handle export
  const handleExport = async () => {
    try {
      const data = await activityLogsApi.export(filters)
      if (data) {
        // Convert to CSV
        const headers = ["ID", "Description", "Event", "Causer", "Subject", "Created At"]
        const rows = data.map((log) => [
          log.id,
          log.description,
          log.event,
          log.causer?.name || "System",
          log.subject?.name || "N/A",
          log.created_at,
        ])
        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n")

        // Download
        const blob = new Blob([csv], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        const today = new Date().toISOString().split('T')[0]
        a.download = `activity-logs-${today}.csv`
        a.click()
        window.URL.revokeObjectURL(url)

        toast.success("Activity logs berhasil diekspor")
      }
    } catch (error) {
      toast.error("Gagal mengekspor activity logs")
    }
  }

  // Get event badge variant
  const getEventBadge = (event: string) => {
    switch (event) {
      case "created":
        return "default"
      case "updated":
        return "secondary"
      case "deleted":
        return "destructive"
      default:
        return "outline"
    }
  }


  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Log aktivitas sistem dan perubahan data
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Ekspor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cari</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari activity..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event</label>
              <Select
                value={filters.event || undefined}
                onValueChange={(value) =>
                  handleFilterChange("event", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
              {filters.event && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs"
                  onClick={() => handleFilterChange("event", undefined)}
                >
                  Hapus filter
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <Input
                type="date"
                value={filters.start_date || ""}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value || undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Akhir</label>
              <Input
                type="date"
                value={filters.end_date || ""}
                onChange={(e) =>
                  handleFilterChange("end_date", e.target.value || undefined)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Activity Log</CardTitle>
          <CardDescription>
            Menampilkan {logs.length} dari {pagination.total} log
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tidak ada activity log ditemukan</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Perubahan</TableHead>
                    <TableHead>Causer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        #{log.id}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm">{log.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEventBadge(log.event)}>
                          {log.event}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.changes && log.changes.length > 0 ? (
                          <div className="space-y-1.5 max-w-md">
                            {log.changes.slice(0, 2).map((change, idx) => (
                              <div key={idx} className="text-xs">
                                <p className="font-medium text-muted-foreground mb-1">
                                  {change.field}
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {change.old !== null ? (
                                    <>
                                      <span className="line-through text-red-600 bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded text-xs">
                                        {change.old}
                                      </span>
                                      <span className="text-muted-foreground text-xs">→</span>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">(baru)</span>
                                  )}
                                  <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded text-xs font-medium">
                                    {change.new}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {log.changes.length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-auto p-1 mt-1"
                                onClick={() => {
                                  setSelectedLog(log)
                                  setIsDetailDialogOpen(true)
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Lihat {log.changes.length - 2} perubahan lainnya
                              </Button>
                            )}
                            {log.changes.length <= 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-auto p-1 mt-1"
                                onClick={() => {
                                  setSelectedLog(log)
                                  setIsDetailDialogOpen(true)
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Detail
                              </Button>
                            )}
                          </div>
                        ) : log.event === 'deleted' ? (
                          <span className="text-xs text-red-600 bg-red-50 dark:bg-red-950 px-2 py-1 rounded">
                            Dihapus
                          </span>
                        ) : log.event === 'created' ? (
                          <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                            Dibuat
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Tidak ada perubahan</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.causer ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{log.causer.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.causer.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.subject ? (
                          <div>
                            <p className="text-sm font-medium">{log.subject.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.subject.type.split("\\").pop()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(log.created_at)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Halaman {pagination.current_page} dari {pagination.last_page}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleFilterChange("page", pagination.current_page - 1)
                      }
                      disabled={pagination.current_page === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleFilterChange("page", pagination.current_page + 1)
                      }
                      disabled={pagination.current_page === pagination.last_page}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Changes Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Detail Perubahan</DialogTitle>
            <DialogDescription>
              {selectedLog?.description || "Perubahan yang dilakukan"}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && selectedLog.changes && selectedLog.changes.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              {selectedLog.changes.map((change, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-sm">{change.field}</p>
                  <div className="flex items-center gap-3">
                    {change.old !== null ? (
                      <>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Nilai Lama:</p>
                          <div className="line-through text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded">
                            {change.old || "(kosong)"}
                          </div>
                        </div>
                        <span className="text-2xl text-muted-foreground">→</span>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Nilai Baru:</p>
                          <div className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-3 py-2 rounded font-medium">
                            {change.new || "(kosong)"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full">
                        <p className="text-xs text-muted-foreground mb-1">Nilai Baru:</p>
                        <div className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-3 py-2 rounded font-medium">
                          {change.new || "(kosong)"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Tidak ada perubahan untuk ditampilkan
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

