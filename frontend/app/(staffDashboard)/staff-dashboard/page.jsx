"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  RefreshCw,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    pendingStudentRequests: 0,
    approvedStudentRequests: 0,
    pendingStaffRequests: 0,
    approvedStaffRequests: 0,
    lowStockItems: 0,
    todayDistributions: 0,
  })
  const [recentStudentRequests, setRecentStudentRequests] = useState([])
  const [recentStaffRequests, setRecentStaffRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)

      // Fetch student requests data
      const studentRequestsResponse = await fetch("/api/requests", {
        credentials: "include",
      })

      // Fetch staff requests data
      const staffRequestsResponse = await fetch("/api/staff/requests", {
        credentials: "include",
      })

      // Fetch inventory data for low stock items
      const inventoryResponse = await fetch("/api/inventory/items", {
        credentials: "include",
      })

      if (!studentRequestsResponse.ok || !inventoryResponse.ok || !staffRequestsResponse.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const studentRequestsData = await studentRequestsResponse.json()
      const inventoryData = await inventoryResponse.json()
      const staffRequestsData = await staffRequestsResponse.json()

      if (studentRequestsData.success && inventoryData.success && staffRequestsData.success) {
        const studentRequests = studentRequestsData.data || []
        const staffRequests = staffRequestsData.data || []
        const inventory = inventoryData.data || []

        // Calculate stats
        const pendingStudentRequests = studentRequests.filter((r) => r.status === "pending").length
        const approvedStudentRequests = studentRequests.filter((r) => r.status === "approved").length
        const pendingStaffRequests = staffRequests.filter((r) => r.status === "pending").length
        const approvedStaffRequests = staffRequests.filter((r) => r.status === "approved").length
        const lowStockItems = inventory.filter((item) => item.quantity <= item.minimum_quantity).length
        const todayDistributions = studentRequests.filter((r) => {
          if (r.status === "distributed" && r.processed_at) {
            const today = new Date().toDateString()
            const processedDate = new Date(r.processed_at).toDateString()
            return today === processedDate
          }
          return false
        }).length

        setStats({
          pendingStudentRequests,
          approvedStudentRequests,
          pendingStaffRequests,
          approvedStaffRequests,
          lowStockItems,
          todayDistributions,
        })

        // Get recent student requests (last 5)
        const recentStudentRequests = studentRequests
          .filter((r) => r.status === "pending" || r.status === "approved")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)

        // Get recent staff requests (last 5)
        const recentStaffRequests = staffRequests
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)

        setRecentStudentRequests(recentStudentRequests)
        setRecentStaffRequests(recentStaffRequests)
      } else {
        setError("Failed to load dashboard data")
        toast.error("Failed to load dashboard data")
      }
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error("Dashboard error:", err)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
    toast.success("Dashboard refreshed")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border-yellow-500/30"
      case "approved":
        return "bg-green-600/20 hover:bg-green-600/30 text-green-300 border-green-500/30"
      case "rejected":
        return "bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-500/30"
      case "distributed":
        return "bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30"
      case "cancelled":
        return "bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border-gray-500/30"
      default:
        return "bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border-gray-500/30"
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

  const getStatusBadge = (status) => {
    switch (status) {
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
            <AlertTriangle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "distributed":
        return (
          <Badge variant="default" className="bg-blue-600">
            <Package className="h-3 w-3 mr-1" />
            Distributed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
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
              Staff Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage inventory, requests, and monitor system activity</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Student Pending</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 bg-opacity-20">
                <Users className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">{stats.pendingStudentRequests}</div>
              <p className="text-xs text-gray-400 mt-1">Student requests pending</p>
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
              <div className="text-2xl font-bold text-white">{stats.approvedStudentRequests}</div>
              <p className="text-xs text-gray-400 mt-1">Ready for distribution</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Staff Pending</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 bg-opacity-20">
                <Clock className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">{stats.pendingStaffRequests}</div>
              <p className="text-xs text-gray-400 mt-1">Staff requests pending</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-cyan-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Staff Approved</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 bg-opacity-20">
                <CheckCircle className="h-4 w-4 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">{stats.approvedStaffRequests}</div>
              <p className="text-xs text-gray-400 mt-1">Staff approved requests</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Low Stock Items</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 bg-opacity-20">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">{stats.lowStockItems}</div>
              <p className="text-xs text-gray-400 mt-1">Need restocking</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Today's Distributions</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 bg-opacity-20">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">{stats.todayDistributions}</div>
              <p className="text-xs text-gray-400 mt-1">Items distributed today</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-400" />
                Inventory Management
              </CardTitle>
              <CardDescription className="text-gray-400">Add, edit, and manage inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Link href="/staff-dashboard/inventory" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View Inventory
                  </Button>
                </Link>
                <Link href="/staff-dashboard/inventory?action=add" className="flex-1">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-green-400" />
                Request Management
              </CardTitle>
              <CardDescription className="text-gray-400">Process student and staff requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Link href="/staff-dashboard/requests" className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Requests
                  </Button>
                </Link>
                <Link href="/staff-dashboard/requests?filter=pending" className="flex-1">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending ({stats.pendingStudentRequests + stats.pendingStaffRequests})
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
                Stock Alerts
              </CardTitle>
              <CardDescription className="text-gray-400">Monitor low stock and create stock requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Link href="/staff-dashboard/inventory?filter=low-stock" className="flex-1">
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Low Stock ({stats.lowStockItems})
                  </Button>
                </Link>
                <Link href="/staff-dashboard/requests?action=create" className="flex-1">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Student Requests */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                Recent Student Requests
              </CardTitle>
              <CardDescription className="text-gray-400">
                Latest student inventory requests requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentStudentRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent student requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStudentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-200">{request.item_name}</h4>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {request.item_code}
                          </Badge>
                          <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>
                            <strong>Student:</strong> {request.student_name} ({request.student_id})
                          </span>
                          <span>
                            <strong>Qty:</strong> {request.quantity}
                            {request.approved_quantity && request.approved_quantity !== request.quantity && (
                              <span className="text-green-400"> (Approved: {request.approved_quantity})</span>
                            )}
                          </span>
                          <span>
                            <strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1 max-w-[300px] truncate">
                          <strong>Purpose:</strong> {request.purpose}
                        </div>
                      </div>
                      <div className="flex items-center flex-col gap-3">
                        {getStatusBadge(request.status)}
                        <Link href={`/staff-dashboard/requests?id=${request.id}&tab=student`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link href="/staff-dashboard/requests?tab=student">
                      <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        View All Student Requests
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Staff Requests */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-400" />
                Recent Staff Requests
              </CardTitle>
              <CardDescription className="text-gray-400">Your latest inventory requests</CardDescription>
            </CardHeader>
            <CardContent>
              {recentStaffRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent staff requests found</p>
                  <Link href="/staff-dashboard/requests?action=create">
                    <Button variant="outline" className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Request
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStaffRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-200">{request.item_name}</h4>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {request.item_code}
                          </Badge>
                          <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>
                            <strong>Qty:</strong> {request.quantity}
                            {request.approved_quantity && request.approved_quantity !== request.quantity && (
                              <span className="text-green-400"> (Approved: {request.approved_quantity})</span>
                            )}
                          </span>
                          <span>
                            <strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1 max-w-[300px] truncate">
                          <strong>Purpose:</strong> {request.purpose}
                        </div>
                      </div>
                      <div className="flex items-center flex-col gap-3">
                        {getStatusBadge(request.status)}
                        <Link href={`/staff-dashboard/requests?id=${request.id}&tab=staff`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link href="/staff-dashboard/requests?tab=staff">
                      <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        View All Staff Requests
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
