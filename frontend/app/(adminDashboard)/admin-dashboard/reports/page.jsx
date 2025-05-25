"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  BarChart3,
  Download,
  RefreshCw,
  FileText,
  Users,
  Package,
  ClipboardList,
  AlertTriangle,
  Eye,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { toast } from "sonner"

// Report Form Component
const ReportForm = ({ onSubmit, submitText, formData, handleInputChange, submitting }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Report Name *</Label>
      <Input
        id="name"
        value={formData.name || ""}
        onChange={(e) => handleInputChange("name", e.target.value)}
        placeholder="Enter report name"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="reportType">Report Type *</Label>
      <Select value={formData.type || ""} onValueChange={(value) => handleInputChange("type", value)}>
        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-100">
          <SelectValue placeholder="Select report type" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          <SelectItem value="inventory" className="text-gray-100">
            Inventory Report
          </SelectItem>
          <SelectItem value="users" className="text-gray-100">
            Users Report
          </SelectItem>
          <SelectItem value="requests" className="text-gray-100">
            Requests Report
          </SelectItem>
          <SelectItem value="distributions" className="text-gray-100">
            Distributions Report
          </SelectItem>
          <SelectItem value="stock-movements" className="text-gray-100">
            Stock Movements
          </SelectItem>
          <SelectItem value="summary" className="text-gray-100">
            Summary Report
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="dateFrom">From Date *</Label>
        <Input
          id="dateFrom"
          type="date"
          value={formData.dateFrom || ""}
          onChange={(e) => handleInputChange("dateFrom", e.target.value)}
          className="bg-gray-700/50 border-gray-600 text-gray-100"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateTo">To Date *</Label>
        <Input
          id="dateTo"
          type="date"
          value={formData.dateTo || ""}
          onChange={(e) => handleInputChange("dateTo", e.target.value)}
          className="bg-gray-700/50 border-gray-600 text-gray-100"
          required
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description || ""}
        onChange={(e) => handleInputChange("description", e.target.value)}
        placeholder="Enter report description"
        className="bg-gray-700/50 border-gray-600 text-gray-100"
        rows={3}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="format">Format *</Label>
      <Select value={formData.format || "pdf"} onValueChange={(value) => handleInputChange("format", value)}>
        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          <SelectItem value="pdf" className="text-gray-100">
            PDF
          </SelectItem>
          <SelectItem value="excel" className="text-gray-100">
            Excel
          </SelectItem>
          <SelectItem value="csv" className="text-gray-100">
            CSV
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <DialogFooter>
      <Button type="submit" disabled={submitting}>
        {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
        {submitText}
      </Button>
    </DialogFooter>
  </form>
)

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reportForm, setReportForm] = useState({
    name: "",
    type: "",
    dateFrom: "",
    dateTo: "",
    description: "",
    format: "pdf",
  })
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalInventory: 0,
    totalRequests: 0,
    lowStockItems: 0,
  })

  useEffect(() => {
    fetchReports()
    fetchDashboardStats()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/reports", {
        credentials: "include",
      })
      const result = await response.json()

      if (result.success) {
        setReports(result.data)
      } else {
        toast.error("Failed to fetch reports")
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Error loading reports")
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        credentials: "include",
      })
      const result = await response.json()

      if (result.success) {
        const { stats } = result.data
        setDashboardStats({
          totalUsers: stats.totalStudents + stats.totalStaff,
          totalInventory: stats.totalItems,
          totalRequests: stats.pendingRequests,
          lowStockItems: stats.lowStockItems,
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  }

  const handleInputChange = useCallback((field, value) => {
    setReportForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleAddReport = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(reportForm),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Report created successfully")
        setIsAddDialogOpen(false)
        resetForm()
        fetchReports()
      } else {
        toast.error(result.message || "Failed to create report")
      }
    } catch (error) {
      console.error("Error creating report:", error)
      toast.error("Error creating report")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReport = async (e) => {
    e.preventDefault()
    if (!selectedReport) return
    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(reportForm),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Report updated successfully")
        setIsEditDialogOpen(false)
        resetForm()
        fetchReports()
      } else {
        toast.error(result.message || "Failed to update report")
      }
    } catch (error) {
      console.error("Error updating report:", error)
      toast.error("Error updating report")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReport = async () => {
    if (!selectedReport) return
    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Report deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedReport(null)
        fetchReports()
      } else {
        toast.error(result.message || "Failed to delete report")
      }
    } catch (error) {
      console.error("Error deleting report:", error)
      toast.error("Error deleting report")
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateReport = async (reportId) => {
    setGenerating(true)

    try {
      const response = await fetch(`/api/admin/reports/${reportId}/generate`, {
        method: "POST",
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Report generated successfully")
        fetchReports()
      } else {
        toast.error(result.message || "Failed to generate report")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Error generating report")
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadReport = async (reportId, format = "pdf") => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/download?format=${format}`, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `report-${reportId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("Report downloaded successfully")
      } else {
        toast.error("Failed to download report")
      }
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error("Error downloading report")
    }
  }

  const resetForm = () => {
    setReportForm({
      name: "",
      type: "",
      dateFrom: "",
      dateTo: "",
      description: "",
      format: "pdf",
    })
    setSelectedReport(null)
  }

  const openEditDialog = (report) => {
    setSelectedReport(report)
    setReportForm({
      name: report.name || "",
      type: report.type || "",
      dateFrom: report.date_from || "",
      dateTo: report.date_to || "",
      description: report.description || "",
      format: report.format || "pdf",
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (report) => {
    setSelectedReport(report)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (report) => {
    setSelectedReport(report)
    setIsDeleteDialogOpen(true)
  }

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

  const getReportTypeBadge = (type) => {
    const colors = {
      inventory: "bg-purple-600",
      users: "bg-blue-600",
      requests: "bg-yellow-600",
      distributions: "bg-green-600",
      "stock-movements": "bg-orange-600",
      summary: "bg-red-600",
    }
    return (
      <Badge className={`${colors[type] || "bg-gray-600"} text-white`}>
        {type?.charAt(0).toUpperCase() + type?.slice(1).replace("-", " ")}
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-gray-400 mt-1">Generate, manage and view system reports</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchReports} variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Create New Report</DialogTitle>
                <DialogDescription className="text-gray-400">Create a new report configuration</DialogDescription>
              </DialogHeader>
              <ReportForm
                onSubmit={handleAddReport}
                submitText="Create Report"
                formData={reportForm}
                handleInputChange={handleInputChange}
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">{dashboardStats.totalUsers}</div>
            <p className="text-xs text-blue-400/70">Students & Staff</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-300">{dashboardStats.totalInventory}</div>
            <p className="text-xs text-purple-400/70">Total items</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Total Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-300">{dashboardStats.totalRequests}</div>
            <p className="text-xs text-yellow-400/70">Pending requests</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">{dashboardStats.lowStockItems}</div>
            <p className="text-xs text-red-400/70">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-orange-400" />
            Reports ({reports.length})
          </CardTitle>
          <CardDescription className="text-gray-400">Manage and generate system reports</CardDescription>
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
                  <TableHead className="text-gray-300">Report Name</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Date Range</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                  <TableHead className="text-gray-300">Format</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="border-gray-700 hover:bg-gray-700/30">
                    <TableCell className="text-gray-300 font-medium">{report.name}</TableCell>
                    <TableCell>{getReportTypeBadge(report.type)}</TableCell>
                    <TableCell className="text-gray-300">
                      {formatDate(report.date_from)} - {formatDate(report.date_to)}
                    </TableCell>
                    <TableCell className="text-gray-300">{formatDate(report.created_at)}</TableCell>
                    <TableCell className="text-gray-300 uppercase">{report.format}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(report)} className="text-gray-300">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(report)} className="text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => handleGenerateReport(report.id)}
                            className="text-blue-400"
                            disabled={generating}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate
                          </DropdownMenuItem>
                          {report.status === "completed" && (
                            <DropdownMenuItem
                              onClick={() => handleDownloadReport(report.id, report.format)}
                              className="text-green-400"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(report)}
                            className="text-red-400 focus:text-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && reports.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports created yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Edit Report</DialogTitle>
            <DialogDescription className="text-gray-400">Update report configuration</DialogDescription>
          </DialogHeader>
          <ReportForm
            onSubmit={handleEditReport}
            submitText="Update Report"
            formData={reportForm}
            handleInputChange={handleInputChange}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Report Details</DialogTitle>
            <DialogDescription className="text-gray-400">View report information and summary</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Report Name</Label>
                  <p className="text-gray-100 mt-1">{selectedReport.name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Type</Label>
                  <div className="mt-1">{getReportTypeBadge(selectedReport.type)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Date Range</Label>
                  <p className="text-gray-100 mt-1">
                    {formatDate(selectedReport.date_from)} - {formatDate(selectedReport.date_to)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">Format</Label>
                  <p className="text-gray-100 mt-1 uppercase">{selectedReport.format}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Created</Label>
                  <p className="text-gray-100 mt-1">{formatDate(selectedReport.created_at)}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
              </div>
              {selectedReport.description && (
                <div>
                  <Label className="text-gray-300">Description</Label>
                  <p className="text-gray-100 mt-1">{selectedReport.description}</p>
                </div>
              )}
              {selectedReport.generated_by && (
                <div>
                  <Label className="text-gray-300">Generated By</Label>
                  <p className="text-gray-100 mt-1">{selectedReport.generated_by}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => handleGenerateReport(selectedReport?.id)}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Generate Report
            </Button>
            {selectedReport?.status === "completed" && (
              <Button
                onClick={() => handleDownloadReport(selectedReport.id, selectedReport.format)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the report{" "}
              <span className="font-semibold text-gray-300">{selectedReport?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
