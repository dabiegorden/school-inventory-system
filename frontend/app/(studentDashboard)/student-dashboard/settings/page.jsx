"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Lock, Save, Eye, EyeOff, RefreshCw } from "lucide-react"
import { toast } from "sonner"

const Settings = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/student/profile", {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch profile")

      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setProfileData({
          fullName: data.data.full_name || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
        })
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to load profile data")
      console.error("Profile error:", err)
      toast.error("Failed to load profile data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchProfile()
    toast.success("Profile refreshed")
  }

  const handleUpdateProfile = async () => {
    try {
      setError("")
      setSuccess("")

      if (!profileData.fullName || !profileData.email) {
        setError("Full name and email are required")
        toast.error("Full name and email are required")
        return
      }

      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess("Profile updated successfully")
        toast.success("Profile updated successfully")
        fetchProfile() // Refresh profile data
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to update profile")
      console.error("Update profile error:", err)
      toast.error("Failed to update profile")
    }
  }

  const handleChangePassword = async () => {
    try {
      setError("")
      setSuccess("")

      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError("All password fields are required")
        toast.error("All password fields are required")
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match")
        toast.error("New passwords do not match")
        return
      }

      if (passwordData.newPassword.length < 6) {
        setError("New password must be at least 6 characters long")
        toast.error("New password must be at least 6 characters long")
        return
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess("Password changed successfully")
        toast.success("Password changed successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to change password")
      console.error("Change password error:", err)
      toast.error("Failed to change password")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-700 rounded-lg"></div>
              <div className="h-64 bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-400 mt-1">Manage your account settings and preferences</p>
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

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg">
            <p className="text-green-300">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-100">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 bg-opacity-20">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Read-only fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-300">Student ID</Label>
                  <Input
                    value={profile?.student_id || ""}
                    disabled
                    className="bg-gray-600 border-gray-500 text-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-300">Class</Label>
                  <Input value={profile?.class || ""} disabled className="bg-gray-600 border-gray-500 text-gray-300" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-300">Grade</Label>
                  <Input value={profile?.grade || ""} disabled className="bg-gray-600 border-gray-500 text-gray-300" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-300">Status</Label>
                  <Input value={profile?.status || ""} disabled className="bg-gray-600 border-gray-500 text-gray-300" />
                </div>
              </div>

              <Separator className="bg-gray-600" />

              {/* Editable fields */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-100">Editable Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-gray-300">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="Enter your email address"
                      className="bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone" className="text-gray-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpdateProfile} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Account Information</CardTitle>
              <CardDescription className="text-gray-400">View your account details and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-300">Account Created</Label>
                  <p className="text-sm text-gray-200">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-300">Last Login</Label>
                  <p className="text-sm text-gray-200">
                    {profile?.last_login ? new Date(profile.last_login).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-100">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 bg-opacity-20">
                  <Lock className="h-4 w-4 text-red-400" />
                </div>
                Change Password
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-gray-300">
                  Current Password *
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-gray-300">
                  New Password *
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter your new password"
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirm New Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} variant="destructive">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings
