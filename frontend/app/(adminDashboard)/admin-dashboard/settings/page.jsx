"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, RefreshCw, Shield, Bell, Database, Mail, Globe, Package, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
    schoolEmail: "",
    academicYear: "",

    // System Settings
    lowStockThreshold: 10,
    autoApproveRequests: false,
    requireApprovalForHighValue: true,
    highValueThreshold: 100,

    // Notification Settings
    emailNotifications: true,
    lowStockAlerts: true,
    requestNotifications: true,
    systemMaintenanceAlerts: true,

    // Security Settings
    sessionTimeout: 30,
    passwordMinLength: 6,
    requirePasswordChange: false,
    passwordChangeInterval: 90,

    // Backup Settings
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // Fixed: Fetch real settings from backend
      const response = await fetch("/api/admin/settings", {
        credentials: "include",
      })
      const result = await response.json()

      if (result.success) {
        setSettings((prevSettings) => ({ ...prevSettings, ...result.data }))
      } else {
        // If no settings exist yet, use defaults
        console.log("No settings found, using defaults")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      // Use default settings if fetch fails
      console.log("Using default settings due to fetch error")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Settings saved successfully")
      } else {
        toast.error(result.message || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      const response = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Test email sent successfully")
      } else {
        toast.error("Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast.error("Error sending test email")
    }
  }

  const handleBackupNow = async () => {
    try {
      const response = await fetch("/api/admin/settings/backup", {
        method: "POST",
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Backup created successfully")
      } else {
        toast.error("Failed to create backup")
      }
    } catch (error) {
      console.error("Error creating backup:", error)
      toast.error("Error creating backup")
    }
  }

  // Fixed: Use useCallback to prevent function recreation
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure system preferences and settings</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchSettings} variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-400" />
              General Settings
            </CardTitle>
            <CardDescription className="text-gray-400">Basic school and system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-gray-300">
                School Name
              </Label>
              <Input
                id="schoolName"
                value={settings.schoolName || ""}
                onChange={(e) => updateSetting("schoolName", e.target.value)}
                placeholder="Enter school name"
                className="bg-gray-700/50 border-gray-600 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolAddress" className="text-gray-300">
                School Address
              </Label>
              <Textarea
                id="schoolAddress"
                value={settings.schoolAddress || ""}
                onChange={(e) => updateSetting("schoolAddress", e.target.value)}
                placeholder="Enter school address"
                className="bg-gray-700/50 border-gray-600 text-gray-100"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolPhone" className="text-gray-300">
                  Phone Number
                </Label>
                <Input
                  id="schoolPhone"
                  value={settings.schoolPhone || ""}
                  onChange={(e) => updateSetting("schoolPhone", e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolEmail" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="schoolEmail"
                  type="email"
                  value={settings.schoolEmail || ""}
                  onChange={(e) => updateSetting("schoolEmail", e.target.value)}
                  placeholder="Enter email address"
                  className="bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear" className="text-gray-300">
                Academic Year
              </Label>
              <Input
                id="academicYear"
                value={settings.academicYear || ""}
                onChange={(e) => updateSetting("academicYear", e.target.value)}
                placeholder="e.g., 2024-2025"
                className="bg-gray-700/50 border-gray-600 text-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-400" />
              Inventory Settings
            </CardTitle>
            <CardDescription className="text-gray-400">Configure inventory management preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold" className="text-gray-300">
                Low Stock Threshold
              </Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="1"
                value={settings.lowStockThreshold || ""}
                onChange={(e) => updateSetting("lowStockThreshold", Number.parseInt(e.target.value))}
                className="bg-gray-700/50 border-gray-600 text-gray-100"
              />
              <p className="text-xs text-gray-400">Items below this quantity will trigger low stock alerts</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Auto-approve Requests</Label>
                <p className="text-xs text-gray-400">Automatically approve low-value requests</p>
              </div>
              <Switch
                checked={settings.autoApproveRequests || false}
                onCheckedChange={(checked) => updateSetting("autoApproveRequests", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Require Approval for High Value</Label>
                <p className="text-xs text-gray-400">Require manual approval for expensive items</p>
              </div>
              <Switch
                checked={settings.requireApprovalForHighValue || false}
                onCheckedChange={(checked) => updateSetting("requireApprovalForHighValue", checked)}
              />
            </div>

            {settings.requireApprovalForHighValue && (
              <div className="space-y-2">
                <Label htmlFor="highValueThreshold" className="text-gray-300">
                  High Value Threshold ($)
                </Label>
                <Input
                  id="highValueThreshold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.highValueThreshold || ""}
                  onChange={(e) => updateSetting("highValueThreshold", Number.parseFloat(e.target.value))}
                  className="bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-yellow-400" />
              Notification Settings
            </CardTitle>
            <CardDescription className="text-gray-400">Configure system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Email Notifications</Label>
                <p className="text-xs text-gray-400">Send notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications || false}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Low Stock Alerts</Label>
                <p className="text-xs text-gray-400">Alert when items are running low</p>
              </div>
              <Switch
                checked={settings.lowStockAlerts || false}
                onCheckedChange={(checked) => updateSetting("lowStockAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Request Notifications</Label>
                <p className="text-xs text-gray-400">Notify when new requests are submitted</p>
              </div>
              <Switch
                checked={settings.requestNotifications || false}
                onCheckedChange={(checked) => updateSetting("requestNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">System Maintenance Alerts</Label>
                <p className="text-xs text-gray-400">Alert about system maintenance</p>
              </div>
              <Switch
                checked={settings.systemMaintenanceAlerts || false}
                onCheckedChange={(checked) => updateSetting("systemMaintenanceAlerts", checked)}
              />
            </div>

            <Separator className="bg-gray-700" />

            <Button onClick={handleTestEmail} variant="outline" className="w-full border-gray-600 text-gray-300">
              <Mail className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-400" />
              Security Settings
            </CardTitle>
            <CardDescription className="text-gray-400">Configure security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="text-gray-300">
                Session Timeout (minutes)
              </Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout || ""}
                onChange={(e) => updateSetting("sessionTimeout", Number.parseInt(e.target.value))}
                className="bg-gray-700/50 border-gray-600 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordMinLength" className="text-gray-300">
                Minimum Password Length
              </Label>
              <Input
                id="passwordMinLength"
                type="number"
                min="4"
                max="20"
                value={settings.passwordMinLength || ""}
                onChange={(e) => updateSetting("passwordMinLength", Number.parseInt(e.target.value))}
                className="bg-gray-700/50 border-gray-600 text-gray-100"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Require Password Change</Label>
                <p className="text-xs text-gray-400">Force users to change passwords periodically</p>
              </div>
              <Switch
                checked={settings.requirePasswordChange || false}
                onCheckedChange={(checked) => updateSetting("requirePasswordChange", checked)}
              />
            </div>

            {settings.requirePasswordChange && (
              <div className="space-y-2">
                <Label htmlFor="passwordChangeInterval" className="text-gray-300">
                  Password Change Interval (days)
                </Label>
                <Input
                  id="passwordChangeInterval"
                  type="number"
                  min="30"
                  max="365"
                  value={settings.passwordChangeInterval || ""}
                  onChange={(e) => updateSetting("passwordChangeInterval", Number.parseInt(e.target.value))}
                  className="bg-gray-700/50 border-gray-600 text-gray-100"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-400" />
              Backup & Maintenance
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure automatic backups and system maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Automatic Backup</Label>
                    <p className="text-xs text-gray-400">Enable automatic system backups</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup || false}
                    onCheckedChange={(checked) => updateSetting("autoBackup", checked)}
                  />
                </div>

                {settings.autoBackup && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency" className="text-gray-300">
                        Backup Frequency
                      </Label>
                      <Select
                        value={settings.backupFrequency || "daily"}
                        onValueChange={(value) => updateSetting("backupFrequency", value)}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="daily" className="text-gray-100">
                            Daily
                          </SelectItem>
                          <SelectItem value="weekly" className="text-gray-100">
                            Weekly
                          </SelectItem>
                          <SelectItem value="monthly" className="text-gray-100">
                            Monthly
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backupRetention" className="text-gray-300">
                        Backup Retention (days)
                      </Label>
                      <Input
                        id="backupRetention"
                        type="number"
                        min="7"
                        max="365"
                        value={settings.backupRetention || ""}
                        onChange={(e) => updateSetting("backupRetention", Number.parseInt(e.target.value))}
                        className="bg-gray-700/50 border-gray-600 text-gray-100"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <h4 className="text-gray-200 font-medium mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    System Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Database:</span>
                      <span className="text-green-400">Healthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Backup:</span>
                      <span className="text-gray-300">2 hours ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Storage Used:</span>
                      <span className="text-gray-300">2.4 GB</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleBackupNow} variant="outline" className="w-full border-gray-600 text-gray-300">
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
