"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  UserCheck,
  Package,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
  Plus,
  RefreshCw,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    students: { total: 0, active: 0 },
    staff: { total: 0, active: 0 },
    inventory: { total: 0, lowStock: 0, outOfStock: 0 },
    requests: { total: 0, pending: 0, approved: 0, rejected: 0, distributed: 0 },
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)

      // Fetch dashboard statistics from the admin endpoint
      const response = await fetch("/api/admin/dashboard", {
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        const { stats, recentActivities } = result.data

        setDashboardData({
          students: {
            total: stats.totalStudents,
            active: stats.totalStudents, // Assuming all fetched students are active
          },
          staff: {
            total: stats.totalStaff,
            active: stats.totalStaff, // Assuming all fetched staff are active
          },
          inventory: {
            total: stats.totalItems,
            lowStock: stats.lowStockItems,
            outOfStock: 0, // Can be added to backend if needed
          },
          requests: {
            total: stats.pendingRequests,
            pending: stats.pendingRequests,
            approved: 0, // Can be enhanced in backend
            rejected: 0, // Can be enhanced in backend
            distributed: 0, // Can be enhanced in backend
          },
          recentActivity: recentActivities || [],
        })
      } else {
        toast.error("Failed to load dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, action }) => (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
          <Icon
            className={`h-4 w-4 ${color.includes("blue") ? "text-blue-400" : color.includes("green") ? "text-green-400" : color.includes("yellow") ? "text-yellow-400" : color.includes("red") ? "text-red-400" : "text-purple-400"}`}
          />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-white">{loading ? "..." : value}</div>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
            <span className="text-xs text-green-400">{trend}</span>
          </div>
        )}
        {action && <div className="mt-3">{action}</div>}
      </CardContent>
    </Card>
  )

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200">
      <div
        className={`p-2 rounded-full ${
          activity.type === "request"
            ? "bg-blue-500/20 text-blue-400"
            : activity.type === "distribution"
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-500/20 text-gray-400"
        }`}
      >
        {activity.type === "request" ? (
          <ClipboardList className="h-4 w-4" />
        ) : activity.type === "distribution" ? (
          <Package className="h-4 w-4" />
        ) : (
          <BarChart3 className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">{activity.activity}</p>
        <p className="text-xs text-gray-400">{activity.user_name}</p>
      </div>
      <Badge variant="outline" className="text-xs">
        {new Date(activity.created_at).toLocaleDateString()}
      </Badge>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening in your school.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={dashboardData.students.total}
          subtitle={`${dashboardData.students.active} active students`}
          icon={Users}
          color="from-blue-500 to-blue-600"
          action={
            <Link href="/admin-dashboard/students">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <Eye className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          }
        />

        <StatCard
          title="Total Staff"
          value={dashboardData.staff.total}
          subtitle={`${dashboardData.staff.active} active staff`}
          icon={UserCheck}
          color="from-green-500 to-green-600"
          action={
            <Link href="/admin-dashboard/staff">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <Eye className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          }
        />

        <StatCard
          title="Inventory Items"
          value={dashboardData.inventory.total}
          subtitle={`${dashboardData.inventory.lowStock} low stock alerts`}
          icon={Package}
          color="from-purple-500 to-purple-600"
          action={
            <Link href="/admin-dashboard/inventory">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Eye className="h-3 w-3 mr-1" />
                Manage
              </Button>
            </Link>
          }
        />

        <StatCard
          title="Pending Requests"
          value={dashboardData.requests.pending}
          subtitle={`${dashboardData.requests.total} total requests`}
          icon={ClipboardList}
          color="from-yellow-500 to-orange-500"
          action={
            <Link href="/admin-dashboard/requests">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                <Eye className="h-3 w-3 mr-1" />
                Review
              </Button>
            </Link>
          }
        />
      </div>

      {/* Request Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-300">{dashboardData.requests.pending}</div>
            <p className="text-xs text-yellow-400/70">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Approved Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">{dashboardData.requests.approved}</div>
            <p className="text-xs text-green-400/70">Successfully processed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">{dashboardData.inventory.lowStock}</div>
            <p className="text-xs text-red-400/70">Need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">Latest updates and changes in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => <ActivityItem key={index} activity={activity} />)
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-green-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            <Link href="/admin-dashboard/students?action=add">
              <Button className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30">
                <Users className="h-4 w-4 mr-2" />
                Add New Student
              </Button>
            </Link>

            <Link href="/admin-dashboard/staff?action=add">
              <Button className="w-full justify-start bg-green-600/20 hover:bg-green-600/30 text-green-300 border-green-500/30">
                <UserCheck className="h-4 w-4 mr-2" />
                Add New Staff
              </Button>
            </Link>

            <Link href="/admin-dashboard/inventory">
              <Button className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/30">
                <Package className="h-4 w-4 mr-2" />
                Add Inventory Item
              </Button>
            </Link>

            <Link href="/admin-dashboard/reports">
              <Button className="w-full justify-start bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border-orange-500/30">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </Link>

            {dashboardData.inventory.lowStock > 0 && (
              <Link href="/admin-dashboard/inventory?filter=low-stock">
                <Button className="w-full justify-start bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Check Low Stock ({dashboardData.inventory.lowStock})
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
