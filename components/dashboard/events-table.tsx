"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, ArrowUpDown, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { deleteEvent } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format, parseISO } from "date-fns"

interface MarketingEvent {
  id: string
  date: string
  name: string
  location: string
  marketing_type: string
  topic?: string
  status: string
  attendance?: {
    attendees: number
    clients_from_event: number
    registrant_responses: number
    confirmations: number
  }
  financial_production?: {
    annuity_premium: number
    life_insurance_premium: number
    aum: number
    financial_planning: number
    annuity_commission: number
    life_insurance_commission: number
  }
}

interface EventsTableProps {
  events: MarketingEvent[]
}

export function EventsTable({ events: initialEvents }: EventsTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof MarketingEvent>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Filter events based on search query
  const filteredEvents = initialEvents.filter((event) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      event.name.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.marketing_type.toLowerCase().includes(searchLower) ||
      event.topic?.toLowerCase().includes(searchLower)
    )
  })

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }

    return 0
  })

  const handleSort = (column: keyof MarketingEvent) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const handleDelete = async (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) return

    setIsDeleting(true)
    try {
      await deleteEvent(eventToDelete)
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the event. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    return format(date, "MMM d, yyyy")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-400"
      case "upcoming":
        return "bg-blue-500/20 text-blue-400"
      case "cancelled":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-m8bs-card border-m8bs-border text-white"
          />
        </div>
      </div>

      <div className="rounded-md border border-m8bs-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-m8bs-card-alt bg-gradient-to-r from-m8bs-card to-m8bs-card-alt">
              <TableHead className="text-gray-400 cursor-pointer font-medium py-4" onClick={() => handleSort("date")}>
                <div className="flex items-center gap-2">
                  Date
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer font-medium py-4" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-2">
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer font-medium py-4" onClick={() => handleSort("location")}>
                <div className="flex items-center gap-2">
                  Location
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer font-medium py-4" onClick={() => handleSort("marketing_type")}>
                <div className="flex items-center gap-2">
                  Type
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-gray-400 text-right py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.map((event) => (
              <TableRow key={event.id} className="hover:bg-m8bs-card-alt">
                <TableCell className="font-medium text-white">{formatDate(event.date)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-white">{event.name}</div>
                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-white">{event.location}</TableCell>
                <TableCell className="text-white">{event.marketing_type}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/?event=${event.id}`)}
                            className="h-8 w-8 text-white hover:bg-m8bs-blue/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Details</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/events/edit/${event.id}`)}
                            className="h-8 w-8 text-white hover:bg-m8bs-blue/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Event</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                            className="h-8 w-8 text-white hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Event</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-m8bs-card border-m8bs-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the event and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-m8bs-card-alt border-m8bs-border text-white hover:bg-m8bs-card">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
