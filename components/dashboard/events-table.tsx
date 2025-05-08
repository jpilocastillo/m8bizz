"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { deleteEvent } from "@/lib/data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Event {
  id: string
  date: string
  name: string
  location: string
  type: string
  topic?: string
  budget: number
}

interface EventsTableProps {
  events: Event[]
}

export function EventsTable({ events }: EventsTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Event>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleSort = (column: keyof Event) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedEvents = [...events].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const confirmDelete = (id: string) => {
    setEventToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!eventToDelete) return

    setIsDeleting(true)
    try {
      const { success, error } = await deleteEvent(eventToDelete)

      if (success) {
        toast({
          title: "Event deleted",
          description: "The marketing event has been deleted successfully.",
        })
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Failed to delete event. Please try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleView = (eventId: string) => {
    router.push(`/dashboard?event=${eventId}`)
  }

  const handleEdit = (eventId: string) => {
    router.push(`/dashboard/events/edit/${eventId}`)
  }

  return (
    <>
      <div className="rounded-md border border-[#1f2037] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-[#131525] bg-gradient-to-r from-[#0f1029] to-[#131525]">
              <TableHead className="text-gray-400 cursor-pointer font-medium py-4" onClick={() => handleSort("date")}>
                Date {sortColumn === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer font-medium py-4" onClick={() => handleSort("name")}>
                Name {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="text-gray-400 cursor-pointer font-medium py-4"
                onClick={() => handleSort("location")}
              >
                Location {sortColumn === "location" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer font-medium py-4" onClick={() => handleSort("type")}>
                Type {sortColumn === "type" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer font-medium py-4" onClick={() => handleSort("budget")}>
                Budget {sortColumn === "budget" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="text-gray-400 text-right py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  No marketing events found. Create your first event to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedEvents.map((event) => (
                <TableRow key={event.id} className="hover:bg-[#1f2037]/70 border-[#1f2037] transition-colors">
                  <TableCell className="font-medium text-white">{formatDate(event.date)}</TableCell>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>{formatCurrency(event.budget)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                        onClick={() => handleView(event.id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-green-500/20 hover:text-green-400 transition-colors"
                        onClick={() => handleEdit(event.id)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        onClick={() => confirmDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the marketing event and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
