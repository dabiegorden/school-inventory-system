"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  FileText,
  ShoppingCart,
  Loader2,
  Ban,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

const RequestsPage = () => {
  const [studentRequests, setStudentRequests] = useState([])
  const [staffRequests, setStaffRequests] = useState([])
  const [allStaffRequests, setAllStaffRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState("")
  const [inventoryItems, setInventoryItems] = useState([])
  const [activeTab, setActiveTab] = useState("student")
  const [refreshing, setRefreshing] = useState(false)

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Process form state
  const [processData, setProcessData] = useState({
    status: "",
    remarks: "",
    approvedQuantity: "",
  })

  // New request form state
  const [newRequestData, setNewRequestData] = useState({
    itemId: "",
    quantity: "",
    purpose: "",
    urgency: "medium",
    notes: "",
  })

  useEffect(() => {
    fetchStudentRequests()
    fetchStaffRequests()
    fetchAllStaffRequests()
    fetchInventoryItems()
  }, [])

  const fetchStudentRequests = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/requests?${params}`, {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch student requests")

      const data = await response.json()
      if (data.success) {
        setStudentRequests(data.data || [])
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to load student requests data")
      console.error("Student requests error:", err)
      toast.error("Failed to load student requests data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchStaffRequests = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/staff/requests?${params}`, {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch staff requests")

      const data = await response.json()
      if (data.success) {
        setStaffRequests(data.data || [])
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to load staff requests")
      console.error("Staff requests error:", err)
      toast.error("Failed to load staff requests")
    }
  }

  const fetchAllStaffRequests = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/staff/requests/all?${params}`, {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch all staff requests")

      const data = await response.json()
      if (data.success) {
        setAllStaffRequests(data.data || [])
      } else {
        console.error("Failed to load all staff requests:", data.message)
      }
    } catch (err) {
      console.error("All staff requests error:", err)
    }
  }

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch("/api/inventory/items?status=active", {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch inventory items")

      const data = await response.json()
      if (data.success) {
        setInventoryItems(data.data)
      } else {
        console.error("Failed to load inventory items:", data.message)
      }
    } catch (err) {
      console.error("Inventory items error:", err)
    }
  }

  const handleRefresh = () => {
    fetchStudentRequests()
    fetchStaffRequests()
    fetchAllStaffRequests()
    toast.success("Data refreshed")
  }

  const handleProcessRequest = async () => {
    if (!selectedRequest) return

    try {
      setIsSubmitting(true)
      const endpoint = selectedRequest.staff_name
        ? `/api/staff/requests/${selectedRequest.id}/status`
        : `/api/requests/${selectedRequest.id}/status`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: processData.status,
          remarks: processData.remarks,
          approvedQuantity: processData.approvedQuantity ? Number.parseInt(processData.approvedQuantity) : undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setIsProcessModalOpen(false)
        setSelectedRequest(null)
        setProcessData({ status: "", remarks: "", approvedQuantity: "" })
        setSuccess("Request processed successfully")
        toast.success("Request processed successfully")

        // Refresh data
        fetchStudentRequests()
        fetchStaffRequests()
        fetchAllStaffRequests()

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to process request")
      console.error("Process request error:", err)
      toast.error("Failed to process request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateRequest = async () => {
    try {
      // Validate form
      if (!newRequestData.itemId) {
        setError("Please select an item")
        toast.error("Please select an item")
        return
      }
      if (!newRequestData.quantity || Number(newRequestData.quantity) <= 0) {
        setError("Please enter a valid quantity")
        toast.error("Please enter a valid quantity")
        return
      }
      if (!newRequestData.purpose) {
        setError("Please enter a purpose")
        toast.error("Please enter a purpose")
        return
      }

      setIsSubmitting(true)
      setError("")

      const response = await fetch("/api/staff/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemId: Number(newRequestData.itemId),
          quantity: Number(newRequestData.quantity),
          purpose: newRequestData.purpose,
          urgency: newRequestData.urgency,
          notes: newRequestData.notes,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setIsCreateRequestModalOpen(false)
        setNewRequestData({
          itemId: "",
          quantity: "",
          purpose: "",
          urgency: "medium",
          notes: "",
        })
        setSuccess("Request created successfully")
        toast.success("Request created successfully")

        // Refresh staff requests
        fetchStaffRequests()
        fetchAllStaffRequests()

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        setError(data.message || "Failed to create request")
        toast.error(data.message || "Failed to create request")
      }
    } catch (err) {
      setError("Failed to create request")
      console.error("Create request error:", err)
      toast.error("Failed to create request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRequest = async (requestId) => {
    if (!confirm("Are you sure you want to cancel this request?")) return

    try {
      const response = await fetch(`/api/staff/requests/${requestId}/cancel`, {
        method: "PUT",
        credentials: "include",
      })

      const data = await response.json()
      if (data.success) {
        setSuccess("Request cancelled successfully")
        toast.success("Request cancelled successfully")
        fetchStaffRequests()
        fetchAllStaffRequests()

        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to cancel request")
      console.error("Cancel request error:", err)
      toast.error("Failed to cancel request")
    }
  }

  const openDetailModal = (request) => {
    setSelectedRequest(request)
    setIsDetailModalOpen(true)
  }

  const openProcessModal = (request) => {
    setSelectedRequest(request)
    setProcessData({
      status: "",
      remarks: "",
      approvedQuantity: request.quantity.toString(),
    })
    setIsProcessModalOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
      case "approved":
        return "bg-green-600/20 text-green-300 border-green-500/30"
      case "rejected":
        return "bg-red-600/20 text-red-300 border-red-500/30"
      case "distributed":
        return "bg-blue-600/20 text-blue-300 border-blue-500/30"
      case "cancelled":
        return "bg-gray-600/20 text-gray-300 border-gray-500/30"
      default:
        return "bg-gray-600/20 text-gray-300 border-gray-500/30"
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-600/20 text-red-300 border-red-500/30"
      case "medium":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-600/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-600/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "distributed":
        return <Package className="h-4 w-4" />
      case "cancelled":
        return <Ban className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredStudentRequests = studentRequests.filter((request) => {
    const matchesSearch =
      request.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item_code?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || statusFilter === "all" || request.status === statusFilter
    const matchesUrgency = !urgencyFilter || urgencyFilter === "all" || request.urgency === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
  })

  const filteredStaffRequests = (activeTab === "staff" ? staffRequests : allStaffRequests).filter((request) => {
    const matchesSearch =
      request.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || statusFilter === "all" || request.status === statusFilter
    const matchesUrgency = !urgencyFilter || urgencyFilter === "all" || request.urgency === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="h-96 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Request Management
            </h1>
            <p className="text-gray-400 mt-1">Process and manage inventory requests</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateRequestModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Request
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg">
            <p className="text-green-300">{success}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Student Pending</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 bg-opacity-20">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">
                {studentRequests.filter((r) => r.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Student Approved</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 bg-opacity-20">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">
                {studentRequests.filter((r) => r.status === "approved").length}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Distributed</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 bg-opacity-20">
                <Package className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">
                {studentRequests.filter((r) => r.status === "distributed").length}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">My Staff Requests</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 bg-opacity-20">
                <FileText className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">{staffRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-gray-300">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status" className="text-gray-300">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="distributed">Distributed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="urgency" className="text-gray-300">
                  Urgency
                </Label>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="All urgencies" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All urgencies</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Student and Staff Requests */}
        <Tabs defaultValue="student" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="student" className="data-[state=active]:bg-gray-700 text-gray-300">
              Student Requests
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-gray-700 text-gray-300">
              My Staff Requests
            </TabsTrigger>
            <TabsTrigger value="all-staff" className="data-[state=active]:bg-gray-700 text-gray-300">
              All Staff Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            {/* Student Requests Table */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Student Requests ({filteredStudentRequests.length})</CardTitle>
                <CardDescription className="text-gray-400">
                  Process and manage student inventory requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Student</TableHead>
                        <TableHead className="text-gray-300">Item</TableHead>
                        <TableHead className="text-gray-300">Quantity</TableHead>
                        <TableHead className="text-gray-300">Urgency</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudentRequests.map((request) => (
                        <TableRow key={request.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-200">{request.student_name}</div>
                              <div className="text-sm text-gray-400">
                                {request.student_id} - {request.class}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-200">{request.item_name}</div>
                              <div className="text-sm text-gray-400">{request.item_code}</div>
                              <div className="text-xs text-gray-500">Available: {request.available_quantity}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-200">{request.quantity}</span>
                              {request.approved_quantity && request.approved_quantity !== request.quantity && (
                                <span className="text-sm text-green-400">(Approved: {request.approved_quantity})</span>
                              )}
                              {request.quantity > request.available_quantity && (
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getUrgencyColor(request.urgency)}>{request.urgency}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-300">
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                            {request.processed_at && (
                              <div className="text-xs text-gray-500">
                                Processed: {new Date(request.processed_at).toLocaleDateString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                                <DropdownMenuItem
                                  onClick={() => openDetailModal(request)}
                                  className="text-gray-300 hover:bg-gray-700"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {request.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() => openProcessModal(request)}
                                    className="text-gray-300 hover:bg-gray-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Process Request
                                  </DropdownMenuItem>
                                )}
                                {request.status === "approved" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedRequest(request)
                                      setProcessData({ status: "distributed", remarks: "", approvedQuantity: "" })
                                      setIsProcessModalOpen(true)
                                    }}
                                    className="text-gray-300 hover:bg-gray-700"
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Mark as Distributed
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredStudentRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No student requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            {/* My Staff Requests Table */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">My Staff Requests ({staffRequests.length})</CardTitle>
                <CardDescription className="text-gray-400">View and manage your own staff requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Item</TableHead>
                        <TableHead className="text-gray-300">Quantity</TableHead>
                        <TableHead className="text-gray-300">Purpose</TableHead>
                        <TableHead className="text-gray-300">Urgency</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffRequests.map((request) => (
                        <TableRow key={request.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-200">{request.item_name}</div>
                              <div className="text-sm text-gray-400">{request.item_code}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-200">{request.quantity}</span>
                              {request.approved_quantity && request.approved_quantity !== request.quantity && (
                                <span className="text-sm text-green-400">(Approved: {request.approved_quantity})</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate text-gray-300" title={request.purpose}>
                              {request.purpose}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getUrgencyColor(request.urgency)}>{request.urgency}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-300">
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                            {request.processed_at && (
                              <div className="text-xs text-gray-500">
                                Processed: {new Date(request.processed_at).toLocaleDateString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                                <DropdownMenuItem
                                  onClick={() => openDetailModal(request)}
                                  className="text-gray-300 hover:bg-gray-700"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {request.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() => handleCancelRequest(request.id)}
                                    className="text-gray-300 hover:bg-gray-700"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Cancel Request
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {staffRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No staff requests found</p>
                      <Button
                        variant="outline"
                        className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => setIsCreateRequestModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Request
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-staff">
            {/* All Staff Requests Table */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">All Staff Requests ({allStaffRequests.length})</CardTitle>
                <CardDescription className="text-gray-400">
                  Process and manage all staff inventory requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Staff</TableHead>
                        <TableHead className="text-gray-300">Item</TableHead>
                        <TableHead className="text-gray-300">Quantity</TableHead>
                        <TableHead className="text-gray-300">Purpose</TableHead>
                        <TableHead className="text-gray-300">Urgency</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaffRequests.map((request) => (
                        <TableRow key={request.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-200">{request.staff_name}</div>
                              <div className="text-sm text-gray-400">{request.staff_employee_id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-200">{request.item_name}</div>
                              <div className="text-sm text-gray-400">{request.item_code}</div>
                              <div className="text-xs text-gray-500">Available: {request.available_quantity}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-200">{request.quantity}</span>
                              {request.approved_quantity && request.approved_quantity !== request.quantity && (
                                <span className="text-sm text-green-400">(Approved: {request.approved_quantity})</span>
                              )}
                              {request.quantity > request.available_quantity && (
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate text-gray-300" title={request.purpose}>
                              {request.purpose}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getUrgencyColor(request.urgency)}>{request.urgency}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-300">
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                            {request.processed_at && (
                              <div className="text-xs text-gray-500">
                                Processed: {new Date(request.processed_at).toLocaleDateString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                                <DropdownMenuItem
                                  onClick={() => openDetailModal(request)}
                                  className="text-gray-300 hover:bg-gray-700"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {request.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() => openProcessModal(request)}
                                    className="text-gray-300 hover:bg-gray-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Process Request
                                  </DropdownMenuItem>
                                )}
                                {request.status === "approved" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedRequest(request)
                                      setProcessData({ status: "distributed", remarks: "", approvedQuantity: "" })
                                      setIsProcessModalOpen(true)
                                    }}
                                    className="text-gray-300 hover:bg-gray-700"
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Mark as Distributed
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredStaffRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No staff requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Request Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                View detailed information about this request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedRequest.student_name ? (
                    <div>
                      <Label className="text-sm font-medium text-gray-300">Student</Label>
                      <p className="text-sm text-gray-200">{selectedRequest.student_name}</p>
                      <p className="text-xs text-gray-400">
                        {selectedRequest.student_id} - {selectedRequest.class}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium text-gray-300">Staff</Label>
                      <p className="text-sm text-gray-200">{selectedRequest.staff_name}</p>
                      {selectedRequest.staff_employee_id && (
                        <p className="text-xs text-gray-400">{selectedRequest.staff_employee_id}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Item</Label>
                    <p className="text-sm text-gray-200">{selectedRequest.item_name}</p>
                    <p className="text-xs text-gray-400">{selectedRequest.item_code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Requested Quantity</Label>
                    <p className="text-sm text-gray-200">{selectedRequest.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Available Stock</Label>
                    <p className="text-sm text-gray-200">{selectedRequest.available_quantity || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Purpose</Label>
                    <p className="text-sm text-gray-200">{selectedRequest.purpose}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Urgency</Label>
                    <Badge className={getUrgencyColor(selectedRequest.urgency)}>{selectedRequest.urgency}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Status</Label>
                    <Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Request Date</Label>
                    <p className="text-sm text-gray-200">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                  {selectedRequest.processed_at && (
                    <div>
                      <Label className="text-sm font-medium text-gray-300">Processed Date</Label>
                      <p className="text-sm text-gray-200">{new Date(selectedRequest.processed_at).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedRequest.processed_by_name && (
                    <div>
                      <Label className="text-sm font-medium text-gray-300">Processed By</Label>
                      <p className="text-sm text-gray-200">{selectedRequest.processed_by_name}</p>
                    </div>
                  )}
                  {selectedRequest.approved_quantity && (
                    <div>
                      <Label className="text-sm font-medium text-gray-300">Approved Quantity</Label>
                      <p className="text-sm text-gray-200">{selectedRequest.approved_quantity}</p>
                    </div>
                  )}
                </div>
                {selectedRequest.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Notes</Label>
                    <p className="text-sm bg-gray-700 p-3 rounded border border-gray-600 text-gray-200">
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}
                {selectedRequest.remarks && (
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Remarks</Label>
                    <p className="text-sm bg-gray-700 p-3 rounded border border-gray-600 text-gray-200">
                      {selectedRequest.remarks}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Process Request Modal */}
        <Dialog open={isProcessModalOpen} onOpenChange={setIsProcessModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Process Request</DialogTitle>
              <DialogDescription className="text-gray-400">
                Process request from {selectedRequest?.student_name || selectedRequest?.staff_name || "staff"} for{" "}
                {selectedRequest?.item_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="processStatus" className="text-gray-300">
                  Action *
                </Label>
                <Select
                  value={processData.status}
                  onValueChange={(value) => setProcessData({ ...processData, status: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder={processData.status ? processData.status : "Select action"} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="approved">Approve Request</SelectItem>
                    <SelectItem value="rejected">Reject Request</SelectItem>
                    <SelectItem value="distributed">Mark as Distributed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {processData.status === "approved" && (
                <div>
                  <Label htmlFor="approvedQuantity" className="text-gray-300">
                    Approved Quantity
                  </Label>
                  <Input
                    id="approvedQuantity"
                    type="number"
                    value={processData.approvedQuantity}
                    onChange={(e) => setProcessData({ ...processData, approvedQuantity: e.target.value })}
                    placeholder="Enter approved quantity"
                    max={selectedRequest?.quantity}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Requested: {selectedRequest?.quantity}, Available: {selectedRequest?.available_quantity || "N/A"}
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="processRemarks" className="text-gray-300">
                  Remarks
                </Label>
                <Textarea
                  id="processRemarks"
                  value={processData.remarks}
                  onChange={(e) => setProcessData({ ...processData, remarks: e.target.value })}
                  placeholder="Enter remarks (optional)"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsProcessModalOpen(false)}
                disabled={isSubmitting}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessRequest}
                className={
                  processData.status === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : processData.status === "rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                }
                disabled={!processData.status || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : processData.status === "approved" ? (
                  "Approve"
                ) : processData.status === "rejected" ? (
                  "Reject"
                ) : processData.status === "distributed" ? (
                  "Mark Distributed"
                ) : (
                  "Process"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Staff Request Modal */}
        <Dialog open={isCreateRequestModalOpen} onOpenChange={setIsCreateRequestModalOpen}>
          <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Create Stock Request</DialogTitle>
              <DialogDescription className="text-gray-400">Request inventory items for staff use</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="itemId" className="text-gray-300">
                  Item *
                </Label>
                <Select
                  value={newRequestData.itemId}
                  onValueChange={(value) => setNewRequestData({ ...newRequestData, itemId: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} ({item.item_code}) - Available: {item.quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity" className="text-gray-300">
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newRequestData.quantity}
                  onChange={(e) => setNewRequestData({ ...newRequestData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  min="1"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="purpose" className="text-gray-300">
                  Purpose *
                </Label>
                <Input
                  id="purpose"
                  value={newRequestData.purpose}
                  onChange={(e) => setNewRequestData({ ...newRequestData, purpose: e.target.value })}
                  placeholder="Enter purpose for this request"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="urgency" className="text-gray-300">
                  Urgency
                </Label>
                <Select
                  value={newRequestData.urgency}
                  onValueChange={(value) => setNewRequestData({ ...newRequestData, urgency: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes" className="text-gray-300">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={newRequestData.notes}
                  onChange={(e) => setNewRequestData({ ...newRequestData, notes: e.target.value })}
                  placeholder="Enter any additional notes or details"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateRequestModalOpen(false)}
                disabled={isSubmitting}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateRequest} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default RequestsPage
