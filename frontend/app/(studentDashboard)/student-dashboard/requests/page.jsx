"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertTriangle,
  Loader2,
  Package2,
} from "lucide-react"
import { toast } from "sonner"

const StudentRequests = () => {
  const [requests, setRequests] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // New request form state
  const [newRequest, setNewRequest] = useState({
    itemId: "",
    quantity: "",
    purpose: "",
    urgency: "normal",
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    fetchRequests()
    fetchInventory()
  }, [])

  const fetchRequests = async () => {
    try {
      setRefreshing(true)
      setError("")

      const response = await fetch("/api/requests/my-requests", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setRequests(data.data || [])
      } else {
        setError(data.message || "Failed to fetch requests")
        toast.error(data.message || "Failed to fetch requests")
      }
    } catch (err) {
      const errorMessage = "Failed to load requests"
      setError(errorMessage)
      console.error("Requests error:", err)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory/available", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        // Filter only available items (quantity > 0)
        const availableItems = (data.data || []).filter((item) => item.quantity > 0)
        setInventory(availableItems)
      }
    } catch (err) {
      console.error("Inventory error:", err)
      toast.error("Failed to load available items")
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!newRequest.itemId) {
      errors.itemId = "Please select an item"
    }

    if (!newRequest.quantity) {
      errors.quantity = "Please enter quantity"
    } else {
      const qty = Number.parseInt(newRequest.quantity)
      if (isNaN(qty) || qty <= 0) {
        errors.quantity = "Quantity must be a positive number"
      } else {
        const selectedItem = inventory.find((item) => item.id.toString() === newRequest.itemId)
        if (selectedItem && qty > selectedItem.quantity) {
          errors.quantity = `Only ${selectedItem.quantity} available in stock`
        }
      }
    }

    if (!newRequest.purpose.trim()) {
      errors.purpose = "Please provide a reason for this request"
    } else if (newRequest.purpose.trim().length < 10) {
      errors.purpose = "Please provide a more detailed reason (at least 10 characters)"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRefresh = () => {
    fetchRequests()
    fetchInventory()
    toast.success("Data refreshed")
  }

  const resetForm = () => {
    setNewRequest({
      itemId: "",
      quantity: "",
      purpose: "",
      urgency: "normal",
    })
    setFormErrors({})
  }

  const handleCreateRequest = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }

    try {
      setCreating(true)

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemId: Number.parseInt(newRequest.itemId),
          quantity: Number.parseInt(newRequest.quantity),
          purpose: newRequest.purpose.trim(),
          urgency: newRequest.urgency,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Request submitted successfully")
        setIsNewRequestOpen(false)
        resetForm()
        fetchRequests()
        fetchInventory() // Refresh to update available quantities
      } else {
        toast.error(data.message || "Failed to create request")
      }
    } catch (err) {
      console.error("Create request error:", err)
      toast.error("Failed to create request")
    } finally {
      setCreating(false)
    }
  }

  const handleCancelRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: "PUT",
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Request cancelled successfully")
        fetchRequests()
      } else {
        toast.error(data.message || "Failed to cancel request")
      }
    } catch (err) {
      console.error("Cancel request error:", err)
      toast.error("Failed to cancel request")
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-900/50 text-green-300 border-green-700"
      case "pending":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700"
      case "rejected":
        return "bg-red-900/50 text-red-300 border-red-700"
      case "distributed":
        return "bg-blue-900/50 text-blue-300 border-blue-700"
      case "cancelled":
        return "bg-gray-900/50 text-gray-300 border-gray-700"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-700"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "distributed":
        return <Package2 className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "bg-red-900/50 text-red-300 border-red-700"
      case "medium":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700"
      case "normal":
        return "bg-blue-900/50 text-blue-300 border-blue-700"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-700"
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item_code?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status?.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const selectedItem = inventory.find((item) => item.id.toString() === newRequest.itemId)

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              My Requests
            </h1>
            <p className="text-gray-400 mt-1">Manage your inventory requests</p>
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
            <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Request</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Request items from the inventory for your academic needs
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item" className="text-gray-300">
                      Item *
                    </Label>
                    <Select
                      value={newRequest.itemId}
                      onValueChange={(value) => {
                        setNewRequest({ ...newRequest, itemId: value })
                        if (formErrors.itemId) {
                          setFormErrors({ ...formErrors, itemId: "" })
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`bg-gray-700 border-gray-600 ${formErrors.itemId ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {inventory.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              <span className="text-xs text-gray-400">
                                {item.category_name} • Available: {item.quantity}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.itemId && <p className="text-red-400 text-sm mt-1">{formErrors.itemId}</p>}
                  </div>

                  <div>
                    <Label htmlFor="quantity" className="text-gray-300">
                      Quantity *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedItem?.quantity || 999}
                      value={newRequest.quantity}
                      onChange={(e) => {
                        setNewRequest({ ...newRequest, quantity: e.target.value })
                        if (formErrors.quantity) {
                          setFormErrors({ ...formErrors, quantity: "" })
                        }
                      }}
                      placeholder="Enter quantity"
                      className={`bg-gray-700 border-gray-600 text-gray-100 ${formErrors.quantity ? "border-red-500" : ""}`}
                    />
                    {selectedItem && (
                      <p className="text-xs text-gray-400 mt-1">Available: {selectedItem.quantity} units</p>
                    )}
                    {formErrors.quantity && <p className="text-red-400 text-sm mt-1">{formErrors.quantity}</p>}
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="text-gray-300">
                      Urgency Level
                    </Label>
                    <Select
                      value={newRequest.urgency}
                      onValueChange={(value) => setNewRequest({ ...newRequest, urgency: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="purpose" className="text-gray-300">
                      Purpose/Reason *
                    </Label>
                    <Textarea
                      id="purpose"
                      value={newRequest.purpose}
                      onChange={(e) => {
                        setNewRequest({ ...newRequest, purpose: e.target.value })
                        if (formErrors.purpose) {
                          setFormErrors({ ...formErrors, purpose: "" })
                        }
                      }}
                      placeholder="Explain why you need this item (e.g., for class project, lab work, etc.)"
                      className={`bg-gray-700 border-gray-600 text-gray-100 ${formErrors.purpose ? "border-red-500" : ""}`}
                      rows={3}
                    />
                    <p className="text-xs text-gray-400 mt-1">{newRequest.purpose.length}/500 characters</p>
                    {formErrors.purpose && <p className="text-red-400 text-sm mt-1">{formErrors.purpose}</p>}
                  </div>

                  {selectedItem && (
                    <Alert className="bg-blue-900/20 border-blue-700">
                      <Package className="h-4 w-4" />
                      <AlertDescription className="text-blue-300">
                        <strong>{selectedItem.name}</strong>
                        <br />
                        Category: {selectedItem.category_name}
                        <br />
                        {selectedItem.description && `Description: ${selectedItem.description}`}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsNewRequestOpen(false)
                        resetForm()
                      }}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRequest} className="bg-blue-600 hover:bg-blue-700" disabled={creating}>
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Request
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by item name, code, or purpose..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="distributed">Distributed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Request History</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredRequests.length} of {requests.length} requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Item</TableHead>
                      <TableHead className="text-gray-300">Quantity</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Urgency</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} className="border-gray-700">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-gray-600">
                              <Package className="h-4 w-4 text-gray-300" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-100">{request.item_name}</p>
                              <p className="text-sm text-gray-400">Code: {request.item_code}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-100">
                          {request.approved_quantity && request.approved_quantity !== request.quantity ? (
                            <div>
                              <span className="line-through text-gray-500">{request.quantity}</span>
                              <span className="ml-2 text-green-400">{request.approved_quantity}</span>
                            </div>
                          ) : (
                            request.quantity
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getUrgencyColor(request.urgency)}>
                            <span className="capitalize">{request.urgency}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-100">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setIsViewDialogOpen(true)
                              }}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {request.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelRequest(request.id)}
                                className="border-red-600 text-red-300 hover:bg-red-900/20"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No requests found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "You haven't made any requests yet"}
                </p>
                <Button onClick={() => setIsNewRequestOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Request Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription className="text-gray-400">Complete information about your request</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Request ID</Label>
                    <p className="text-gray-100 font-mono">#{selectedRequest.id}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1 capitalize">{selectedRequest.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Item</Label>
                    <p className="text-gray-100">{selectedRequest.item_name}</p>
                    <p className="text-sm text-gray-400">Code: {selectedRequest.item_code}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Quantity</Label>
                    <div className="text-gray-100">
                      {selectedRequest.approved_quantity &&
                      selectedRequest.approved_quantity !== selectedRequest.quantity ? (
                        <div>
                          <span className="line-through text-gray-500">Requested: {selectedRequest.quantity}</span>
                          <br />
                          <span className="text-green-400">Approved: {selectedRequest.approved_quantity}</span>
                        </div>
                      ) : (
                        selectedRequest.quantity
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Urgency</Label>
                    <div className="mt-1">
                      <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                        <span className="capitalize">{selectedRequest.urgency}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Date Created</Label>
                    <p className="text-gray-100">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                <div>
                  <Label className="text-gray-300">Purpose/Reason</Label>
                  <p className="text-gray-100 mt-1 p-3 bg-gray-700 rounded-lg">{selectedRequest.purpose}</p>
                </div>

                {selectedRequest.remarks && (
                  <div>
                    <Label className="text-gray-300">Staff Remarks</Label>
                    <p className="text-gray-100 mt-1 p-3 bg-gray-700 rounded-lg">{selectedRequest.remarks}</p>
                  </div>
                )}

                {selectedRequest.processed_by_name && (
                  <div>
                    <Label className="text-gray-300">Processed By</Label>
                    <p className="text-gray-100">{selectedRequest.processed_by_name}</p>
                  </div>
                )}

                {selectedRequest.status === "pending" && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleCancelRequest(selectedRequest.id)
                        setIsViewDialogOpen(false)
                      }}
                      className="border-red-600 text-red-300 hover:bg-red-900/20"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Request
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default StudentRequests
