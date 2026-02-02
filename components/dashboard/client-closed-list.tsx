"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Download, 
  ChevronDown, 
  ChevronUp,
  ChevronsUpDown,
  Filter,
  X,
  BarChart3
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ClientClosedListProps {
  eventId?: string
  userId?: string
  year?: number
  showYTD?: boolean
}

type SortField = "client_name" | "close_date" | "total_value" | "annuity_premium" | "aum_amount" | "life_insurance_premium"
type SortDirection = "asc" | "desc"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [productFilter, setProductFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("close_date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const [showAnalytics, setShowAnalytics] = useState(false)

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

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = [...clients]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (client) =>
          client.client_name.toLowerCase().includes(query) ||
          (client.notes && client.notes.toLowerCase().includes(query))
      )
    }

    // Apply product filter
    if (productFilter !== "all") {
      filtered = filtered.filter((client) => {
        switch (productFilter) {
          case "annuity":
            return client.annuity_premium > 0
          case "life":
            return client.life_insurance_premium > 0
          case "aum":
            return client.aum_amount > 0
          case "financial_planning":
            return client.financial_planning_fee > 0
          case "commission":
            return client.annuity_commission > 0 || client.life_insurance_commission > 0
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "client_name":
          aValue = a.client_name.toLowerCase()
          bValue = b.client_name.toLowerCase()
          break
        case "close_date":
          aValue = new Date(a.close_date).getTime()
          bValue = new Date(b.close_date).getTime()
          break
        case "total_value":
          aValue = getTotalValue(a)
          bValue = getTotalValue(b)
          break
        case "annuity_premium":
          aValue = a.annuity_premium || 0
          bValue = b.annuity_premium || 0
          break
        case "aum_amount":
          aValue = a.aum_amount || 0
          bValue = b.aum_amount || 0
          break
        case "life_insurance_premium":
          aValue = a.life_insurance_premium || 0
          bValue = b.life_insurance_premium || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [clients, searchQuery, productFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 ml-1" />
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    )
  }

  const toggleExpand = (clientId: string) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId)
    } else {
      newExpanded.add(clientId)
    }
    setExpandedClients(newExpanded)
  }

  const exportToCSV = () => {
    const headers = [
      "Client Name",
      "Close Date",
      "Annuity Premium",
      "Annuity Commission",
      "Annuity Commission %",
      "Life Insurance Premium",
      "Life Insurance Commission",
      "Life Insurance Commission %",
      "AUM Amount",
      "AUM Fee %",
      "AUM Fees",
      "Financial Planning Fee",
      "Total Value",
      "Notes",
    ]

    const rows = filteredAndSortedClients.map((client) => [
      client.client_name,
      format(new Date(client.close_date), "yyyy-MM-dd"),
      client.annuity_premium || 0,
      client.annuity_commission || 0,
      client.annuity_commission_percentage || "",
      client.life_insurance_premium || 0,
      client.life_insurance_commission || 0,
      client.life_insurance_commission_percentage || "",
      client.aum_amount || 0,
      client.aum_fee_percentage || "",
      client.aum_fees || 0,
      client.financial_planning_fee || 0,
      getTotalValue(client),
      client.notes || "",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `clients-${year || new Date().getFullYear()}-${format(new Date(), "yyyy-MM-dd")}.csv`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Client data exported to CSV successfully.",
    })
  }

  // Prepare analytics data
  const analyticsData = useMemo(() => {
    const monthlyData: Record<string, {
      month: string
      clients: number
      totalValue: number
      annuity: number
      life: number
      aum: number
    }> = {}

    filteredAndSortedClients.forEach((client) => {
      const date = new Date(client.close_date)
      const monthKey = format(date, "MMM yyyy")
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          clients: 0,
          totalValue: 0,
          annuity: 0,
          life: 0,
          aum: 0,
        }
      }

      monthlyData[monthKey].clients += 1
      monthlyData[monthKey].totalValue += getTotalValue(client)
      monthlyData[monthKey].annuity += client.annuity_premium || 0
      monthlyData[monthKey].life += client.life_insurance_premium || 0
      monthlyData[monthKey].aum += client.aum_amount || 0
    })

    return Object.values(monthlyData).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    )
  }, [filteredAndSortedClients])

  const productDistribution = useMemo(() => {
    const distribution = {
      annuity: 0,
      life: 0,
      aum: 0,
      financial_planning: 0,
    }

    filteredAndSortedClients.forEach((client) => {
      if (client.annuity_premium > 0) distribution.annuity++
      if (client.life_insurance_premium > 0) distribution.life++
      if (client.aum_amount > 0) distribution.aum++
      if (client.financial_planning_fee > 0) distribution.financial_planning++
    })

    return [
      { name: "Annuity", value: distribution.annuity, color: "#a855f7" },
      { name: "Life Insurance", value: distribution.life, color: "#f97316" },
      { name: "AUM", value: distribution.aum, color: "#22c55e" },
      { name: "Financial Planning", value: distribution.financial_planning, color: "#3b82f6" },
    ].filter((item) => item.value > 0)
  }, [filteredAndSortedClients])

  const totalClients = filteredAndSortedClients.length
  const totalValue = filteredAndSortedClients.reduce((sum, c) => sum + getTotalValue(c), 0)
  const totalAnnuity = filteredAndSortedClients.reduce((sum, c) => sum + (c.annuity_premium || 0), 0)
  const totalAnnuityCommission = filteredAndSortedClients.reduce((sum, c) => sum + (c.annuity_commission || 0), 0)
  const totalLife = filteredAndSortedClients.reduce((sum, c) => sum + (c.life_insurance_premium || 0), 0)
  const totalLifeCommission = filteredAndSortedClients.reduce((sum, c) => sum + (c.life_insurance_commission || 0), 0)
  const totalAUM = filteredAndSortedClients.reduce((sum, c) => sum + (c.aum_amount || 0), 0)
  const totalPlanning = filteredAndSortedClients.reduce((sum, c) => sum + (c.financial_planning_fee || 0), 0)

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
            {totalClients !== clients.length && (
              <span className="text-sm text-m8bs-muted ml-2">
                ({totalClients} of {clients.length})
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="border-m8bs-border text-white hover:bg-m8bs-card-alt"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showAnalytics ? "Hide" : "Show"} Analytics
            </Button>
            {filteredAndSortedClients.length > 0 && (
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="border-m8bs-border text-white hover:bg-m8bs-card-alt"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
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
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-m8bs-muted" />
              <Input
                placeholder="Search clients by name or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-m8bs-card-alt border-m8bs-border text-white"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 text-m8bs-muted hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-m8bs-card-alt border-m8bs-border text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="annuity">Annuity</SelectItem>
                <SelectItem value="life">Life Insurance</SelectItem>
                <SelectItem value="aum">AUM</SelectItem>
                <SelectItem value="financial_planning">Financial Planning</SelectItem>
                <SelectItem value="commission">Commissions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analytics Section */}
          {showAnalytics && filteredAndSortedClients.length > 0 && (
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monthly Trends Chart */}
                {analyticsData.length > 0 && (
                  <Card className="bg-m8bs-card-alt border-m8bs-border">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Monthly Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={analyticsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#9ca3af"
                            style={{ fontSize: "12px" }}
                          />
                          <YAxis 
                            stroke="#9ca3af"
                            style={{ fontSize: "12px" }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#1f2937", 
                              border: "1px solid #374151",
                              color: "#fff"
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="clients" 
                            stroke="#3b82f6" 
                            name="Clients"
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="totalValue" 
                            stroke="#22c55e" 
                            name="Total Value"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Product Distribution Chart */}
                {productDistribution.length > 0 && (
                  <Card className="bg-m8bs-card-alt border-m8bs-border">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Product Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={productDistribution}
                            cx="50%"
                            cy="45%"
                            labelLine={true}
                            label={({ name, percent }) => {
                              // Shorten "Life Insurance" to "Life" for better fit
                              const displayName = name === "Life Insurance" ? "Life" : name
                              return `${displayName}: ${(percent * 100).toFixed(0)}%`
                            }}
                            outerRadius={70}
                            innerRadius={20}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {productDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#1f2937", 
                              border: "1px solid #374151",
                              color: "#fff"
                            }}
                            formatter={(value: number, name: string) => [
                              `${value} clients`,
                              name
                            ]}
                          />
                          <Legend 
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => value === "Life Insurance" ? "Life Insurance" : value}
                            wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Monthly Breakdown Bar Chart */}
              {analyticsData.length > 0 && (
                <Card className="bg-m8bs-card-alt border-m8bs-border">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Monthly Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#9ca3af"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis 
                          stroke="#9ca3af"
                          style={{ fontSize: "12px" }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#1f2937", 
                            border: "1px solid #374151",
                            color: "#fff"
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar dataKey="annuity" fill="#a855f7" name="Annuity" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="life" fill="#f97316" name="Life Insurance" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="aum" fill="#22c55e" name="AUM" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
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
          ) : filteredAndSortedClients.length === 0 ? (
            <div className="text-center py-8 text-m8bs-muted">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No clients match your filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setProductFilter("all")
                }}
                className="mt-4 border-m8bs-border text-white hover:bg-m8bs-card-alt"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-m8bs-border">
                  <TableHead className="text-white w-12"></TableHead>
                  <TableHead 
                    className="text-white cursor-pointer hover:text-m8bs-blue transition-colors"
                    onClick={() => handleSort("client_name")}
                  >
                    <div className="flex items-center">
                      Client Name
                      {getSortIcon("client_name")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-white cursor-pointer hover:text-m8bs-blue transition-colors"
                    onClick={() => handleSort("close_date")}
                  >
                    <div className="flex items-center">
                      Close Date
                      {getSortIcon("close_date")}
                    </div>
                  </TableHead>
                  <TableHead className="text-white">Products</TableHead>
                  <TableHead 
                    className="text-white cursor-pointer hover:text-m8bs-blue transition-colors"
                    onClick={() => handleSort("total_value")}
                  >
                    <div className="flex items-center">
                      Total Value
                      {getSortIcon("total_value")}
                    </div>
                  </TableHead>
                  {eventId && <TableHead className="text-white">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedClients.map((client) => {
                  const isExpanded = expandedClients.has(client.id || "")
                  return (
                    <>
                      <TableRow 
                        key={client.id} 
                        className="border-m8bs-border hover:bg-m8bs-card-alt/50 cursor-pointer"
                        onClick={() => client.id && toggleExpand(client.id)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-m8bs-muted" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-m8bs-muted" />
                          )}
                        </TableCell>
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
                          <TableCell onClick={(e) => e.stopPropagation()}>
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
                      {isExpanded && (
                        <TableRow key={`${client.id}-details`} className="border-m8bs-border bg-m8bs-card-alt/30">
                          <TableCell colSpan={eventId ? 6 : 5} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">Annuity Details</h4>
                                <div className="space-y-1 text-sm text-m8bs-muted">
                                  <div>Premium: {formatCurrency(client.annuity_premium || 0)}</div>
                                  <div>Commission: {formatCurrency(client.annuity_commission || 0)}</div>
                                  {client.annuity_commission_percentage && (
                                    <div>Commission %: {client.annuity_commission_percentage}%</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">Life Insurance Details</h4>
                                <div className="space-y-1 text-sm text-m8bs-muted">
                                  <div>Premium: {formatCurrency(client.life_insurance_premium || 0)}</div>
                                  <div>Commission: {formatCurrency(client.life_insurance_commission || 0)}</div>
                                  {client.life_insurance_commission_percentage && (
                                    <div>Commission %: {client.life_insurance_commission_percentage}%</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">AUM Details</h4>
                                <div className="space-y-1 text-sm text-m8bs-muted">
                                  <div>Amount: {formatCurrency(client.aum_amount || 0)}</div>
                                  <div>Fees: {formatCurrency(client.aum_fees || 0)}</div>
                                  {client.aum_fee_percentage && (
                                    <div>Fee %: {client.aum_fee_percentage}%</div>
                                  )}
                                </div>
                              </div>
                              {client.financial_planning_fee > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-2">Financial Planning</h4>
                                  <div className="text-sm text-m8bs-muted">
                                    Fee: {formatCurrency(client.financial_planning_fee)}
                                  </div>
                                </div>
                              )}
                              {client.notes && (
                                <div className="md:col-span-2 lg:col-span-3">
                                  <h4 className="text-sm font-semibold text-white mb-2">Notes</h4>
                                  <p className="text-sm text-m8bs-muted whitespace-pre-wrap">{client.notes}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
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

