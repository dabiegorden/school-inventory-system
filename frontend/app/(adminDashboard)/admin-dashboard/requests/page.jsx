"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClipboardList,
  Search,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  ShoppingCart,
  User,
  Shield,
} from "lucide-react"
import { toast } from "sonner"

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [staffRequests, setStaffRequests] = useState([])
  const [stockRequests, setStockRequests] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedStockRequest, setSelectedStockRequest] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false)
  const [isStockApproveDialogOpen, setIsStockApproveDialogOpen] = useState(false)
  const [isStockRejectDialogOpen, setIsStockRejectDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [approvedQuantity, setApprovedQuantity] = useState("")
  const [actualCost, setActualCost] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("regular")

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      // First check authentication
      const authResponse = await fetch("/api/auth/check", {
        credentials: "include",
      })
      const authResult = await authResponse.json()

      if (!authResult.authenticated) {
        toast.error("Please log in to access this page")
        window.location.href = "/login"
        return
      }

      setCurrentUser(authResult.user)

      // Check if user has admin or staff permissions
      if (!["admin", "staff"].includes(authResult.user?.userType)) {
        toast.error("Insufficient permissions to access this page")
        return
      }

      // Now fetch data
      await Promise.all([fetchRequests(), fetchStaffRequests(), fetchStockRequests()])
    } catch (error) {
      console.error("Error checking auth:", error)
      toast.error("Authentication error")
    }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/requests", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setRequests(result.data)
      } else {
        toast.error(result.message || "Failed to fetch requests")
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Error loading requests")
    } finally {
      setLoading(false)
    }
  }

  const fetchStaffRequests = async () => {
    try {
      const response = await fetch("/api/staff/requests/all", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setStaffRequests(result.data)
      } else {
        console.error("Failed to fetch staff requests:", result.message)
      }
    } catch (error) {
      console.error("Error fetching staff requests:", error)
    }
  }

  const fetchStockRequests = async () => {
    try {
      const response = await fetch("/api/stock-requests", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setStockRequests(result.data)
      } else {
        console.error("Failed to fetch stock requests:", result.message)
      }
    } catch (error) {
      console.error("Error fetching stock requests:", error)
    }
  }

  const handleApproveRequest = async () => {
    setSubmitting(true)

    try {
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
          status: "approved",
          remarks: adminNotes,
          approvedQuantity: approvedQuantity ? Number.parseInt(approvedQuantity) : undefined,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authentication required. Please log in again.")
          window.location.href = "/login"
          return
        } else if (response.status === 403) {
          toast.error("Insufficient permissions to approve requests")
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Request approved successfully")
        setIsApproveDialogOpen(false)
        setAdminNotes("")
        setApprovedQuantity("")
        setSelectedRequest(null)
        fetchRequests()
        fetchStaffRequests()
      } else {
        toast.error(result.message || "Failed to approve request")
      }
    } catch (error) {
      console.error("Error approving request:", error)
      toast.error("Error approving request")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectRequest = async () => {
    setSubmitting(true)

    try {
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
          status: "rejected",
          remarks: adminNotes,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authentication required. Please log in again.")
          window.location.href = "/login"
          return
        } else if (response.status === 403) {
          toast.error("Insufficient permissions to reject requests")
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Request rejected")
        setIsRejectDialogOpen(false)
        setAdminNotes("")
        setSelectedRequest(null)
        fetchRequests()
        fetchStaffRequests()
      } else {
        toast.error(result.message || "Failed to reject request")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast.error("Error rejecting request")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDistributeRequest = async () => {
    setSubmitting(true)

    try {
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
          status: "distributed",
          remarks: adminNotes,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Request marked as distributed")
        setIsDistributeDialogOpen(false)
        setAdminNotes("")
        setSelectedRequest(null)
        fetchRequests()
        fetchStaffRequests()
      } else {
        toast.error(result.message || "Failed to distribute request")
      }
    } catch (error) {
      console.error("Error distributing request:", error)
      toast.error("Error distributing request")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveStockRequest = async () => {
    setSubmitting(true)

    try {
      const response = await fetch(`/api/stock-requests/${selectedStockRequest.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "approved",
          adminNotes: adminNotes,
          approvedQuantity: approvedQuantity ? Number.parseInt(approvedQuantity) : undefined,
          actualCost: actualCost ? Number.parseFloat(actualCost) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Stock request approved successfully")
        setIsStockApproveDialogOpen(false)
        setAdminNotes("")
        setApprovedQuantity("")
        setActualCost("")
        setSelectedStockRequest(null)
        fetchStockRequests()
      } else {
        toast.error(result.message || "Failed to approve stock request")
      }
    } catch (error) {
      console.error("Error approving stock request:", error)
      toast.error("Error approving stock request")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectStockRequest = async () => {
    setSubmitting(true)

    try {
      const response = await fetch(`/api/stock-requests/${selectedStockRequest.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "rejected",
          adminNotes: adminNotes,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success("Stock request rejected")
        setIsStockRejectDialogOpen(false)
        setAdminNotes("")
        setSelectedStockRequest(null)
        fetchStockRequests()
      } else {
        toast.error(result.message || "Failed to reject stock request")
      }
    } catch (error) {
      console.error("Error rejecting stock request:", error)
      toast.error("Error rejecting stock request")
    } finally {
      setSubmitting(false)
    }
  }

  const openViewDialog = (request) => {
    setSelectedRequest(request)
    setIsViewDialogOpen(true)
  }

  const openApproveDialog = (request) => {
    setSelectedRequest(request)
    setAdminNotes("")
    setApprovedQuantity(request.quantity.toString())
    setIsApproveDialogOpen(true)
  }

  const openRejectDialog = (request) => {
    setSelectedRequest(request)
    setAdminNotes("")
    setIsRejectDialogOpen(true)
  }

  const openDistributeDialog = (request) => {
    setSelectedRequest(request)
    setAdminNotes("")
    setIsDistributeDialogOpen(true)
  }

  const openStockApproveDialog = (request) => {
    setSelectedStockRequest(request)
    setAdminNotes("")
    setApprovedQuantity(request.quantity.toString())
    setActualCost(request.estimated_cost?.toString() || "")
    setIsStockApproveDialogOpen(true)
  }

  const openStockRejectDialog = (request) => {
    setSelectedStockRequest(request)
    setAdminNotes("")
    setIsStockRejectDialogOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "distributed":
        return (
          <Badge variant="default" className="bg-blue-600">
            <Truck className="h-3 w-3 mr-1" />
            Distributed
          </Badge>
        )
      case "ordered":
        return (
          <Badge variant="default" className="bg-purple-600">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Ordered
          </Badge>
        )
      case "received":
        return (
          <Badge variant="default" className="bg-green-600">
            <Package className="h-3 w-3 mr-1" />
            Received
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
      case "urgent":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">
            Medium
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  // Combine regular requests and staff requests
  const allRegularRequests = [...requests, ...staffRequests]

  const filteredRequests = allRegularRequests.filter((request) => {
    const matchesSearch =
      request.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    return matchesSearch && request.status?.toLowerCase() === filterStatus
  })

  const filteredStockRequests = stockRequests.filter((request) => {
    const matchesSearch =
      request.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requested_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    return matchesSearch && request.status?.toLowerCase() === filterStatus
  })

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Show loading state while checking auth
  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Requests Management
          </h1>
          <p className="text-gray-400 mt-1">Manage inventory requests and stock replenishment</p>
          {currentUser && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {currentUser.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {currentUser.userType}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={checkAuthAndFetchData} variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs for Regular vs Stock Requests */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="regular" className="data-[state=active]:bg-blue-600">
            Regular Requests ({allRegularRequests.length})
          </TabsTrigger>
          <TabsTrigger value="stock" className="data-[state=active]:bg-purple-600">
            Stock Requests ({stockRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regular">
          {/* Enhanced Stats Cards for Regular Requests */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Total Requests</CardTitle>
                <ClipboardList className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-300">{allRegularRequests.length}</div>
                <p className="text-xs text-blue-400/70">Student & staff requests</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-400">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-300">
                  {allRegularRequests.filter((r) => r.status?.toLowerCase() === "pending").length}
                </div>
                <p className="text-xs text-yellow-400/70">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-300">
                  {allRegularRequests.filter((r) => r.status?.toLowerCase() === "approved").length}
                </div>
                <p className="text-xs text-green-400/70">Ready for distribution</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Distributed</CardTitle>
                <Truck className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-300">
                  {allRegularRequests.filter((r) => r.status?.toLowerCase() === "distributed").length}
                </div>
                <p className="text-xs text-blue-400/70">Completed requests</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-400">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-300">
                  {allRegularRequests.filter((r) => r.status?.toLowerCase() === "rejected").length}
                </div>
                <p className="text-xs text-red-400/70">Declined requests</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search requests by item, requester, ID, or purpose..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-gray-100"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-600 text-gray-300">
                      <Filter className="h-4 w-4 mr-2" />
                      {filterStatus === "all"
                        ? "All Status"
                        : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem onClick={() => setFilterStatus("all")} className="text-gray-300">
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("pending")} className="text-gray-300">
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("approved")} className="text-gray-300">
                      Approved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("distributed")} className="text-gray-300">
                      Distributed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("rejected")} className="text-gray-300">
                      Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Regular Requests Table (now includes staff requests) */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-yellow-400" />
                Regular Requests ({filteredRequests.length})
              </CardTitle>
              <CardDescription className="text-gray-400">Student and staff inventory requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Requester</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Item</TableHead>
                      <TableHead className="text-gray-300">Quantity</TableHead>
                      <TableHead className="text-gray-300">Urgency</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow
                        key={`${request.staff_name ? "staff" : "student"}-${request.id}`}
                        className="border-gray-700 hover:bg-gray-700/30"
                      >
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{request.student_name || request.staff_name}</div>
                            <div className="text-sm text-gray-400">
                              {request.student_id || request.staff_employee_id} • {request.class || request.department}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <Badge
                            variant="outline"
                            className={
                              request.staff_name ? "border-green-500 text-green-400" : "border-blue-500 text-blue-400"
                            }
                          >
                            {request.staff_name ? "Staff" : "Student"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{request.item_name}</div>
                            <div className="text-sm text-gray-400">{request.item_code}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{request.quantity}</div>
                            {request.approved_quantity && request.approved_quantity !== request.quantity && (
                              <div className="text-sm text-green-400">Approved: {request.approved_quantity}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-gray-300">{formatDate(request.created_at)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                              <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openViewDialog(request)} className="text-gray-300">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {request.status?.toLowerCase() === "pending" && (
                                <>
                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem
                                    onClick={() => openApproveDialog(request)}
                                    className="text-green-400"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openRejectDialog(request)} className="text-red-400">
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {request.status?.toLowerCase() === "approved" && (
                                <>
                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem
                                    onClick={() => openDistributeDialog(request)}
                                    className="text-blue-400"
                                  >
                                    <Truck className="h-4 w-4 mr-2" />
                                    Mark as Distributed
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && filteredRequests.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No requests found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          {/* Stock Requests Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">Total Stock Requests</CardTitle>
                <ShoppingCart className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-300">{stockRequests.length}</div>
                <p className="text-xs text-purple-400/70">All time stock requests</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-400">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-300">
                  {stockRequests.filter((r) => r.status?.toLowerCase() === "pending").length}
                </div>
                <p className="text-xs text-yellow-400/70">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-300">
                  {stockRequests.filter((r) => r.status?.toLowerCase() === "approved").length}
                </div>
                <p className="text-xs text-green-400/70">Ready to order</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">Ordered</CardTitle>
                <ShoppingCart className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-300">
                  {stockRequests.filter((r) => r.status?.toLowerCase() === "ordered").length}
                </div>
                <p className="text-xs text-purple-400/70">In transit</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Received</CardTitle>
                <Package className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-300">
                  {stockRequests.filter((r) => r.status?.toLowerCase() === "received").length}
                </div>
                <p className="text-xs text-blue-400/70">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Requests Table */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-purple-400" />
                Stock Requests ({filteredStockRequests.length})
              </CardTitle>
              <CardDescription className="text-gray-400">Requests for new inventory purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Requested By</TableHead>
                      <TableHead className="text-gray-300">Item</TableHead>
                      <TableHead className="text-gray-300">Quantity</TableHead>
                      <TableHead className="text-gray-300">Priority</TableHead>
                      <TableHead className="text-gray-300">Estimated Cost</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStockRequests.map((request) => (
                      <TableRow key={request.id} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{request.requested_by_name}</div>
                            <div className="text-sm text-gray-400">{request.department}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{request.item_name}</div>
                            <div className="text-sm text-gray-400">{request.item_code}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div>
                            <div className="font-medium">{request.quantity}</div>
                            {request.approved_quantity && request.approved_quantity !== request.quantity && (
                              <div className="text-sm text-green-400">Approved: {request.approved_quantity}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getUrgencyBadge(request.priority)}</TableCell>
                        <TableCell className="text-gray-300">
                          {request.estimated_cost ? `$${Number.parseFloat(request.estimated_cost).toFixed(2)}` : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-gray-300">{formatDate(request.created_at)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                              <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openViewDialog(request)} className="text-gray-300">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {request.status?.toLowerCase() === "pending" && (
                                <>
                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem
                                    onClick={() => openStockApproveDialog(request)}
                                    className="text-green-400"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openStockRejectDialog(request)}
                                    className="text-red-400"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && filteredStockRequests.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No stock requests found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Request Details</DialogTitle>
            <DialogDescription className="text-gray-400">View complete request information</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Requester Name</Label>
                  <p className="text-gray-100 mt-1">
                    {selectedRequest.student_name || selectedRequest.staff_name || selectedRequest.requested_by_name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">ID</Label>
                  <p className="text-gray-100 mt-1">
                    {selectedRequest.student_id || selectedRequest.staff_employee_id}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Item Requested</Label>
                  <p className="text-gray-100 mt-1">{selectedRequest.item_name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Item Code</Label>
                  <p className="text-gray-100 mt-1">{selectedRequest.item_code}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Requested Quantity</Label>
                  <p className="text-gray-100 mt-1">{selectedRequest.quantity}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Purpose/Reason</Label>
                <p className="text-gray-100 mt-1">{selectedRequest.purpose || selectedRequest.reason || "N/A"}</p>
              </div>
              {selectedRequest.remarks && (
                <div>
                  <Label className="text-gray-300">Admin Remarks</Label>
                  <p className="text-gray-100 mt-1">{selectedRequest.remarks}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Request Date</Label>
                  <p className="text-gray-100 mt-1">{formatDate(selectedRequest.created_at)}</p>
                </div>
                {selectedRequest.processed_at && (
                  <div>
                    <Label className="text-gray-300">Processed Date</Label>
                    <p className="text-gray-100 mt-1">{formatDate(selectedRequest.processed_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Approve Request</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to approve this request for{" "}
              <span className="font-semibold text-gray-300">{selectedRequest?.item_name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approvedQuantity" className="text-gray-300">
                Approved Quantity
              </Label>
              <Input
                id="approvedQuantity"
                type="number"
                value={approvedQuantity}
                onChange={(e) => setApprovedQuantity(e.target.value)}
                placeholder="Enter approved quantity"
                className="bg-gray-700/50 border-gray-600 text-gray-100"
                min="1"
                max={selectedRequest?.quantity}
              />
              <p className="text-xs text-gray-400">
                Requested: {selectedRequest?.quantity} | Available: {selectedRequest?.available_quantity}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approveNotes" className="text-gray-300">
                Admin Notes (Optional)
              </Label>
              <Textarea
                id="approveNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                className="bg-gray-700/50 border-gray-600 text-gray-100"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveRequest}
              disabled={submitting || !approvedQuantity}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Approve Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Reject Request</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to reject this request for{" "}
              <span className="font-semibold text-gray-300">{selectedRequest?.item_name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectNotes" className="text-gray-300">
              Reason for Rejection (Required)
            </Label>
            <Textarea
              id="rejectNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Please provide a reason for rejecting this request..."
              className="bg-gray-700/50 border-gray-600 text-gray-100"
              rows={3}
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectRequest}
              disabled={submitting || !adminNotes.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Distribute Dialog */}
      <AlertDialog open={isDistributeDialogOpen} onOpenChange={setIsDistributeDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Mark as Distributed</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Mark this request for <span className="font-semibold text-gray-300">{selectedRequest?.item_name}</span> as
              distributed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="distributeNotes" className="text-gray-300">
              Distribution Notes (Optional)
            </Label>
            <Textarea
              id="distributeNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about this distribution..."
              className="bg-gray-700/50 border-gray-600 text-gray-100"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDistributeRequest}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Mark as Distributed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stock Request Approve Dialog */}
      <AlertDialog open={isStockApproveDialogOpen} onOpenChange={setIsStockApproveDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Approve Stock Request</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to approve this stock request for{" "}
              <span className="font-semibold text-gray-300">{selectedStockRequest?.item_name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockApprovedQuantity" className="text-gray-300">
                  Approved Quantity
                </Label>
                <Input
                  id="stockApprovedQuantity"
                  type="number"
                  value={approvedQuantity}
                  onChange={(e) => setApprovedQuantity(e.target.value)}
                  placeholder="Enter approved quantity"
                  className="bg-gray-700/50 border-gray-600 text-gray-100"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockActualCost" className="text-gray-300">
                  Actual Cost
                </Label>
                <Input
                  id="stockActualCost"
                  type="number"
                  step="0.01"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="Enter actual cost"
                  className="bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockApproveNotes" className="text-gray-300">
                Admin Notes (Optional)
              </Label>
              <Textarea
                id="stockApproveNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                className="bg-gray-700/50 border-gray-600 text-gray-100"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveStockRequest}
              disabled={submitting || !approvedQuantity}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Approve Stock Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stock Request Reject Dialog */}
      <AlertDialog open={isStockRejectDialogOpen} onOpenChange={setIsStockRejectDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Reject Stock Request</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to reject this stock request for{" "}
              <span className="font-semibold text-gray-300">{selectedStockRequest?.item_name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="stockRejectNotes" className="text-gray-300">
              Reason for Rejection (Required)
            </Label>
            <Textarea
              id="stockRejectNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Please provide a reason for rejecting this stock request..."
              className="bg-gray-700/50 border-gray-600 text-gray-100"
              rows={3}
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectStockRequest}
              disabled={submitting || !adminNotes.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Reject Stock Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
