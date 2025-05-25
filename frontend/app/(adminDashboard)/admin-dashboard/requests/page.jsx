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
} from "lucide-react"
import { toast } from "sonner"

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all") // all, pending, approved, rejected

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/requests", {
        credentials: "include",
      })
      const result = await response.json()

      if (result.success) {
        setRequests(result.data)
      } else {
        toast.error("Failed to fetch requests")
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Error loading requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async () => {
    setSubmitting(true)

    try {
      const response = await fetch(`/api/requests/${selectedRequest.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "approved",
          remarks: adminNotes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Request approved successfully")
        setIsApproveDialogOpen(false)
        setAdminNotes("")
        setSelectedRequest(null)
        fetchRequests()
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
      const response = await fetch(`/api/requests/${selectedRequest.id}/status`, {
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

      const result = await response.json()

      if (result.success) {
        toast.success("Request rejected")
        setIsRejectDialogOpen(false)
        setAdminNotes("")
        setSelectedRequest(null)
        fetchRequests()
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

  const openViewDialog = (request) => {
    setSelectedRequest(request)
    setIsViewDialogOpen(true)
  }

  const openApproveDialog = (request) => {
    setSelectedRequest(request)
    setAdminNotes("")
    setIsApproveDialogOpen(true)
  }

  const openRejectDialog = (request) => {
    setSelectedRequest(request)
    setAdminNotes("")
    setIsRejectDialogOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "distributed":
        return (
          <Badge variant="default" className="bg-blue-600">
            Distributed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
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

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose?.toLowerCase().includes(searchTerm.toLowerCase())

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Requests Management
          </h1>
          <p className="text-gray-400 mt-1">Review and manage inventory requests</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchRequests} variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Total Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">{requests.length}</div>
            <p className="text-xs text-blue-400/70">All time requests</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-300">
              {requests.filter((r) => r.status?.toLowerCase() === "pending").length}
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
              {requests.filter((r) => r.status?.toLowerCase() === "approved").length}
            </div>
            <p className="text-xs text-green-400/70">Successfully approved</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">
              {requests.filter((r) => r.status?.toLowerCase() === "rejected").length}
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
                placeholder="Search requests by item, student, ID, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-gray-100"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
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

      {/* Requests Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-yellow-400" />
            Inventory Requests ({filteredRequests.length})
          </CardTitle>
          <CardDescription className="text-gray-400">Review and manage all inventory requests</CardDescription>
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
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="border-gray-700 hover:bg-gray-700/30">
                    <TableCell className="text-gray-300">
                      <div>
                        <div className="font-medium">{request.student_name}</div>
                        <div className="text-sm text-gray-400">{request.student_id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{request.item_name}</TableCell>
                    <TableCell className="text-gray-300">{request.quantity}</TableCell>
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
                              <DropdownMenuItem onClick={() => openApproveDialog(request)} className="text-green-400">
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openRejectDialog(request)} className="text-red-400">
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

          {!loading && filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requests found</p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  <Label className="text-gray-300">Student Name</Label>
                  <p className="text-gray-100 mt-1">{selectedRequest.student_name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Student ID</Label>
                  <p className="text-gray-100 mt-1">{selectedRequest.student_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Item Requested</Label>
                  <p className="text-gray-100 mt-1">{selectedRequest.item_name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Quantity</Label>
                  <p className="text-gray-100 mt-1">{selectedRequest.quantity}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Urgency</Label>
                  <div className="mt-1">{getUrgencyBadge(selectedRequest.urgency)}</div>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Purpose</Label>
                <p className="text-gray-100 mt-1">{selectedRequest.purpose || "N/A"}</p>
              </div>
              <div>
                <Label className="text-gray-300">Additional Notes</Label>
                <p className="text-gray-100 mt-1">{selectedRequest.notes || "N/A"}</p>
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
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveRequest}
              disabled={submitting}
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
    </div>
  )
}
