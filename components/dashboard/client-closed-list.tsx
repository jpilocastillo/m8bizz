"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClientClosedForm } from "./client-closed-form"
import {
  EventClient,
  getClientsByEvent,
  getClientsByUser,
  addClient,
  updateClient,
  deleteClient,
  getYTDSummary,
  EventClientInsert,
  EventClientUpdate,
} from "@/lib/client-tracking"
import { formatCurrency } from "@/lib/utils"
import { Plus, Edit, Trash2, Users, DollarSign, TrendingUp } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface ClientClosedListProps {
  eventId?: string
  userId?: string
  year?: number
  showYTD?: boolean
}

export function ClientClosedList({
  eventId,
  userId,
  year,
  showYTD = false,
}: ClientClosedListProps) {
  const { user } = useAuth()
  const [clients, setClients] = useState<EventClient[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<EventClient | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<EventClient | null>(null)
  const [ytdSummary, setYtdSummary] = useState<any>(null)

  const currentUserId = userId || user?.id || ""

  useEffect(() => {
    loadClients()
    if (showYTD && currentUserId && year) {
      loadYTDSummary()
    }
  }, [eventId, currentUserId, year, showYTD])

  const loadClients = async () => {
    if (!currentUserId) return

    setLoading(true)
    try {
      let data: EventClient[]
      if (eventId) {
        data = await getClientsByEvent(eventId)
      } else if (showYTD && year) {
        data = await getClientsByUser(currentUserId, year)
      } else {
        data = await getClientsByUser(currentUserId)
      }
      setClients(data)
    } catch (error) {
      console.error("Error loading clients:", error)
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadYTDSummary = async () => {
    if (!currentUserId || !year) return

    try {
      const summary = await getYTDSummary(currentUserId, year)
      setYtdSummary(summary)
    } catch (error) {
      console.error("Error loading YTD summary:", error)
    }
  }

  const handleAddClient = async (data: EventClientInsert | EventClientUpdate) => {
    try {
      if (eventId && "event_id" in data) {
        await addClient(data as EventClientInsert)
        toast({
          title: "Success",
          description: "Client added successfully.",
        })
      } else {
        throw new Error("Event ID is required to add a client")
      }
      await loadClients()
      if (showYTD && currentUserId && year) {
        await loadYTDSummary()
      }
    } catch (error) {
      console.error("Error adding client:", error)
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateClient = async (data: EventClientInsert | EventClientUpdate) => {
    if (!editingClient?.id) return

    try {
      await updateClient(editingClient.id, data as EventClientUpdate)
      toast({
        title: "Success",
        description: "Client updated successfully.",
      })
      await loadClients()
      if (showYTD && currentUserId && year) {
        await loadYTDSummary()
      }
      setEditingClient(null)
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete?.id) return

    try {
      await deleteClient(clientToDelete.id)
      toast({
        title: "Success",
        description: "Client deleted successfully.",
      })
      await loadClients()
      if (showYTD && currentUserId && year) {
        await loadYTDSummary()
      }
      setClientToDelete(null)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getProductBadges = (client: EventClient) => {
    const badges = []
    if (client.annuity_premium > 0) {
      badges.push(
        <Badge key="annuity" variant="secondary" className="bg-purple-500/20 text-purple-300">
          Annuity
        </Badge>
      )
    }
    if (client.life_insurance_premium > 0) {
      badges.push(
        <Badge key="life" variant="secondary" className="bg-orange-500/20 text-orange-300">
          Life
        </Badge>
      )
    }
    if (client.aum_amount > 0) {
      badges.push(
        <Badge key="aum" variant="secondary" className="bg-green-500/20 text-green-300">
          AUM
        </Badge>
      )
    }
    if (client.financial_planning_fee > 0) {
      badges.push(
        <Badge key="planning" variant="secondary" className="bg-blue-500/20 text-blue-300">
          Planning
        </Badge>
      )
    }
    if (client.annuity_commission > 0 || client.life_insurance_commission > 0) {
      badges.push(
        <Badge key="commission" variant="secondary" className="bg-yellow-500/20 text-yellow-300">
          Commission
        </Badge>
      )
    }
    return badges
  }

  const getTotalValue = (client: EventClient) => {
    return (
      (client.annuity_premium || 0) +
      (client.life_insurance_premium || 0) +
      (client.aum_amount || 0) +
      (client.financial_planning_fee || 0) +
      (client.annuity_commission || 0) +
      (client.life_insurance_commission || 0)
    )
  }

  const totalClients = clients.length
  const totalValue = clients.reduce((sum, c) => sum + getTotalValue(c), 0)
  const totalAnnuity = clients.reduce((sum, c) => sum + (c.annuity_premium || 0), 0)
  const totalAnnuityCommission = clients.reduce((sum, c) => sum + (c.annuity_commission || 0), 0)
  const totalLife = clients.reduce((sum, c) => sum + (c.life_insurance_premium || 0), 0)
  const totalLifeCommission = clients.reduce((sum, c) => sum + (c.life_insurance_commission || 0), 0)
  const totalAUM = clients.reduce((sum, c) => sum + (c.aum_amount || 0), 0)
  const totalPlanning = clients.reduce((sum, c) => sum + (c.financial_planning_fee || 0), 0)

  if (loading) {
    return (
      <Card className="bg-m8bs-card border-m8bs-border">
        <CardContent className="p-6">
          <div className="text-center text-m8bs-muted">Loading clients...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {showYTD && ytdSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-m8bs-card border-m8bs-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-m8bs-muted">Total Clients YTD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{ytdSummary.total_clients}</div>
              <p className="text-xs text-m8bs-muted mt-1">Year to date</p>
            </CardContent>
          </Card>
          <Card className="bg-m8bs-card border-m8bs-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-m8bs-muted">Total Value YTD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(ytdSummary.total_value)}</div>
              <p className="text-xs text-m8bs-muted mt-1">All products</p>
            </CardContent>
          </Card>
          <Card className="bg-m8bs-card border-m8bs-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-m8bs-muted">Average Deal Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(ytdSummary.average_deal_size)}</div>
              <p className="text-xs text-m8bs-muted mt-1">Per client</p>
            </CardContent>
          </Card>
          <Card className="bg-m8bs-card border-m8bs-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-m8bs-muted">Top Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {ytdSummary.monthly_breakdown.length > 0
                  ? (() => {
                      const topMonth = ytdSummary.monthly_breakdown.reduce((max: any, month: any) => 
                        month.clients > max.clients ? month : max, ytdSummary.monthly_breakdown[0]
                      )
                      return format(
                        new Date(year || new Date().getFullYear(), topMonth.month - 1, 1),
                        "MMM"
                      )
                    })()
                  : "N/A"}
              </div>
              <p className="text-xs text-m8bs-muted mt-1">Most clients</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-m8bs-card border-m8bs-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-m8bs-muted">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalClients}</div>
            </CardContent>
          </Card>
          <Card className="bg-m8bs-card border-m8bs-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-m8bs-muted">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>
          <Card className="bg-m8bs-card border-m8bs-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-m8bs-muted">Annuity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(totalAnnuity)}</div>
            </CardContent>
          </Card>
          <Card className="bg-m8bs-card border-m8bs-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-m8bs-muted">Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totalAnnuityCommission + totalLifeCommission)}
              </div>
              <p className="text-xs text-m8bs-muted mt-1">
                Annuity: {formatCurrency(totalAnnuityCommission)} | Life: {formatCurrency(totalLifeCommission)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions and Table */}
      <Card className="bg-m8bs-card border-m8bs-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">
            {showYTD ? `Clients Closed ${year || new Date().getFullYear()} (YTD)` : "Client Closed Deals"}
          </CardTitle>
          {eventId && (
            <Button
              onClick={() => {
                setEditingClient(null)
                setIsFormOpen(true)
              }}
              className="bg-m8bs-blue hover:bg-m8bs-blue/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-m8bs-muted">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No clients tracked yet.</p>
              {eventId && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 bg-m8bs-blue hover:bg-m8bs-blue/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-m8bs-border">
                  <TableHead className="text-white">Client Name</TableHead>
                  <TableHead className="text-white">Close Date</TableHead>
                  <TableHead className="text-white">Products</TableHead>
                  <TableHead className="text-white">Total Value</TableHead>
                  {eventId && <TableHead className="text-white">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className="border-m8bs-border">
                    <TableCell className="font-medium text-white">{client.client_name}</TableCell>
                    <TableCell className="text-m8bs-muted">
                      {format(new Date(client.close_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getProductBadges(client)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-semibold">
                      {formatCurrency(getTotalValue(client))}
                    </TableCell>
                    {eventId && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingClient(client)
                              setIsFormOpen(true)
                            }}
                            className="h-8 w-8 text-m8bs-muted hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setClientToDelete(client)
                              setDeleteDialogOpen(true)
                            }}
                            className="h-8 w-8 text-m8bs-muted hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {eventId && (
        <ClientClosedForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={editingClient ? handleUpdateClient : handleAddClient}
          eventId={eventId}
          client={editingClient}
          mode={editingClient ? "edit" : "add"}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-m8bs-card border-m8bs-border">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Client</DialogTitle>
            <DialogDescription className="text-m8bs-muted">
              Are you sure you want to delete {clientToDelete?.client_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setClientToDelete(null)
              }}
              className="border-m8bs-border text-white hover:bg-m8bs-card-alt"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClient}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

