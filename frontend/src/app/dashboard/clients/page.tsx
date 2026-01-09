"use client"

import * as React from "react"
import { clientsApi } from "@/lib/api"
import { ClientManagement } from "@/components/clients/client-management"
import type { ClientResource } from "@/types/api"

export default function ClientsPage() {
  const [clients, setClients] = React.useState<ClientResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchClients() {
      setLoading(true)
      setError(null)
      try {
        const clientsData = await clientsApi.getAll()
        setClients(clientsData || [])
      } catch (err) {
        console.error("Error fetching clients:", err)
        setError(err instanceof Error ? err.message : "Gagal memuat data klien")
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Memuat data klien...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return <ClientManagement initialClients={clients} />
}

