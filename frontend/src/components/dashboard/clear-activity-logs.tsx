"use client"

import * as React from "react"
import { activityLogsApi } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ClearActivityLogsProps {
  isSuperAdmin: boolean
}

export function ClearActivityLogs({ isSuperAdmin }: ClearActivityLogsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isClearing, setIsClearing] = React.useState(false)

  // Hidden feature: Keyboard shortcut Ctrl+Shift+C (or Cmd+Shift+C on Mac)
  React.useEffect(() => {
    if (!isSuperAdmin) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+C (Windows/Linux) or Cmd+Shift+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        setIsDialogOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSuperAdmin])

  const handleClear = async () => {
    setIsClearing(true)
    try {
      const result = await activityLogsApi.clear()
      if (result?.success) {
        toast.success(result.message || 'Activity logs cleared successfully')
        setIsDialogOpen(false)
        // Optionally refresh the page or trigger a refresh event
        window.dispatchEvent(new CustomEvent('activityLogsCleared'))
      } else {
        toast.error(result?.message || 'Failed to clear activity logs')
      }
    } catch (error) {
      console.error('Error clearing activity logs:', error)
      toast.error('An error occurred while clearing activity logs')
    } finally {
      setIsClearing(false)
    }
  }

  // Don't render anything visible - this is a hidden feature
  if (!isSuperAdmin) return null

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear Activity Logs</DialogTitle>
          <DialogDescription>
            This action will permanently delete all activity logs. This cannot be undone.
            <br />
            <br />
            <span className="text-xs text-muted-foreground">
              Hidden feature activated by: Ctrl+Shift+C (or Cmd+Shift+C on Mac)
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isClearing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear All Logs'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
