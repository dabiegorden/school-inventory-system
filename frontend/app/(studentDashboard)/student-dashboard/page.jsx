"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, XCircle, Package, User, Settings, RefreshCw, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const StudentDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)

      // Fetch dashboard stats
      const statsResponse = await fetch("/api/student/dashboard/stats", {
        credentials: "include",
      })

      if (!statsResponse.ok) throw new Error("Failed to fetch stats")

      const statsData = await statsResponse.json()
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Fetch recent requests
      const requestsResponse = await fetch("/api/student/requests?limit=5", {
        credentials: "include",
      })

      if (!requestsResponse.ok) throw new Error("Failed to fetch requests")

      const requestsData = await requestsResponse.json()
      if (requestsData.success) {
        setRecentRequests(requestsData.data)
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
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-900/50 text-green-300 border-green-700"
      case "pending":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700"
      case "rejected":
        return "bg-red-900/50 text-red-300 border-red-700"
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
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-700 rounded-lg"></div>
              <div className="h-96 bg-gray-700 rounded-lg"></div>
            </div>
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
              Student Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back! Here's your inventory request overview</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Requests</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileText className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-100">{stats?.totalRequests || 0}</div>
              <p className="text-xs text-blue-300 mt-1">All time requests</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-100">Pending</CardTitle>
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-100">{stats?.pendingRequests || 0}</div>
              <p className="text-xs text-yellow-300 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Approved</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-100">{stats?.approvedRequests || 0}</div>
              <p className="text-xs text-green-300 mt-1">Successfully approved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Rejected</CardTitle>
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-4 w-4 text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-100">{stats?.rejectedRequests || 0}</div>
              <p className="text-xs text-red-300 mt-1">Declined requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-100">Recent Requests</CardTitle>
                  <CardDescription className="text-gray-400">Your latest inventory requests</CardDescription>
                </div>
                <Link href="/student-dashboard/requests">
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50 border border-gray-600"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gray-600">
                          <Package className="h-4 w-4 text-gray-300" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-100">{request.item_name}</p>
                          <p className="text-sm text-gray-400">
                            Qty: {request.quantity} • {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No requests found</p>
                  <Link href="/student-dashboard/requests">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Request
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/student-dashboard/requests">
                  <Button className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Plus className="h-5 w-5 text-blue-200" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-blue-100">New Request</p>
                        <p className="text-sm text-blue-200">Request inventory items</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/student-dashboard/requests">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border-gray-600 hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-600">
                        <FileText className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-100">My Requests</p>
                        <p className="text-sm text-gray-400">View all your requests</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/student-dashboard/settings">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border-gray-600 hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-600">
                        <Settings className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-100">Settings</p>
                        <p className="text-sm text-gray-400">Update your profile</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/50 to-purple-800/30 border border-purple-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-100">Profile Status</p>
                      <p className="text-sm text-purple-200">Student Account Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
