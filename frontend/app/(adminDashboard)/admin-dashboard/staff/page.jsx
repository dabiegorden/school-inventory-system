"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { UserCheck, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Filter, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

// Fixed: Move form component outside to prevent recreation
const StaffForm = ({ onSubmit, submitText, formData, handleInputChange, submitting, selectedStaff }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="staffId">Staff ID</Label>
        <Input
          id="staffId"
          value={formData.staffId || ""}
          onChange={(e) => handleInputChange("staffId", e.target.value)}
          placeholder="Enter staff ID"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName || ""}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          placeholder="Enter full name"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ""}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Enter email address"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone || ""}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="Enter phone number"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department || ""}
          onChange={(e) => handleInputChange("department", e.target.value)}
          placeholder="e.g., IT, Administration"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={formData.position || ""}
          onChange={(e) => handleInputChange("position", e.target.value)}
          placeholder="e.g., Teacher, Administrator"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username || ""}
          onChange={(e) => handleInputChange("username", e.target.value)}
          placeholder="Enter username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password || ""}
          onChange={(e) => handleInputChange("password", e.target.value)}
          placeholder="Enter password"
          required={!selectedStaff}
        />
      </div>
    </div>

    <DialogFooter>
      <Button type="submit" disabled={submitting}>
        {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
        {submitText}
      </Button>
    </DialogFooter>
  </form>
)

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    staffId: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    username: "",
    password: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const searchParams = useSearchParams()

  useEffect(() => {
    fetchStaff()

    if (searchParams.get("action") === "add") {
      setIsAddDialogOpen(true)
    }
  }, [searchParams])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/staff", {
        credentials: "include",
      })
      const result = await response.json()

      if (result.success) {
        setStaff(result.data)
      } else {
        toast.error("Failed to fetch staff")
      }
    } catch (error) {
      console.error("Error fetching staff:", error)
      toast.error("Error loading staff")
    } finally {
      setLoading(false)
    }
  }

  // Fixed: Use useCallback to prevent function recreation
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleAddStaff = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Staff member added successfully")
        setIsAddDialogOpen(false)
        resetForm()
        fetchStaff()
      } else {
        toast.error(result.message || "Failed to add staff member")
      }
    } catch (error) {
      console.error("Error adding staff:", error)
      toast.error("Error adding staff member")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditStaff = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          position: formData.position,
          status: "active",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Staff member updated successfully")
        setIsEditDialogOpen(false)
        resetForm()
        fetchStaff()
      } else {
        toast.error(result.message || "Failed to update staff member")
      }
    } catch (error) {
      console.error("Error updating staff:", error)
      toast.error("Error updating staff member")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStaff = async () => {
    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Staff member deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedStaff(null)
        fetchStaff()
      } else {
        toast.error(result.message || "Failed to delete staff member")
      }
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast.error("Error deleting staff member")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      staffId: "",
      fullName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      username: "",
      password: "",
    })
    setSelectedStaff(null)
  }

  const openEditDialog = (staffMember) => {
    setSelectedStaff(staffMember)
    setFormData({
      staffId: staffMember.staff_id || "",
      fullName: staffMember.full_name || "",
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      department: staffMember.department || "",
      position: staffMember.position || "",
      username: staffMember.username || "",
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (staffMember) => {
    setSelectedStaff(staffMember)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (staffMember) => {
    setSelectedStaff(staffMember)
    setIsDeleteDialogOpen(true)
  }

  const filteredStaff = staff.filter(
    (staffMember) =>
      staffMember.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.staff_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.position?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-gray-400 mt-1">Manage staff accounts and information</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchStaff} variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Add New Staff Member</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new staff account with their details
                </DialogDescription>
              </DialogHeader>
              <StaffForm
                onSubmit={handleAddStaff}
                submitText="Add Staff Member"
                formData={formData}
                handleInputChange={handleInputChange}
                submitting={submitting}
                selectedStaff={selectedStaff}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff by name, ID, email, department, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-gray-100"
              />
            </div>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-green-400" />
            Staff Members ({filteredStaff.length})
          </CardTitle>
          <CardDescription className="text-gray-400">Manage all staff accounts and their information</CardDescription>
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
                  <TableHead className="text-gray-300">Staff ID</TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Department</TableHead>
                  <TableHead className="text-gray-300">Position</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow key={staffMember.id} className="border-gray-700 hover:bg-gray-700/30">
                    <TableCell className="text-gray-300 font-medium">{staffMember.staff_id}</TableCell>
                    <TableCell className="text-gray-300">{staffMember.full_name}</TableCell>
                    <TableCell className="text-gray-300">{staffMember.email}</TableCell>
                    <TableCell className="text-gray-300">{staffMember.department || "N/A"}</TableCell>
                    <TableCell className="text-gray-300">{staffMember.position || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={staffMember.status === "active" ? "default" : "secondary"}>
                        {staffMember.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(staffMember)} className="text-gray-300">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(staffMember)} className="text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(staffMember)}
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

          {!loading && filteredStaff.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No staff members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Edit Staff Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update staff member information and account details
            </DialogDescription>
          </DialogHeader>
          <StaffForm
            onSubmit={handleEditStaff}
            submitText="Update Staff Member"
            formData={formData}
            handleInputChange={handleInputChange}
            submitting={submitting}
            selectedStaff={selectedStaff}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Staff Member Details</DialogTitle>
            <DialogDescription className="text-gray-400">View complete staff member information</DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Staff ID</Label>
                  <p className="text-gray-100 mt-1">{selectedStaff.staff_id}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Full Name</Label>
                  <p className="text-gray-100 mt-1">{selectedStaff.full_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <p className="text-gray-100 mt-1">{selectedStaff.email}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <p className="text-gray-100 mt-1">{selectedStaff.phone || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Department</Label>
                  <p className="text-gray-100 mt-1">{selectedStaff.department || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Position</Label>
                  <p className="text-gray-100 mt-1">{selectedStaff.position || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Username</Label>
                  <p className="text-gray-100 mt-1">{selectedStaff.username}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Badge variant={selectedStaff.status === "active" ? "default" : "secondary"} className="mt-1">
                    {selectedStaff.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Created At</Label>
                  <p className="text-gray-100 mt-1">{new Date(selectedStaff.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Last Login</Label>
                  <p className="text-gray-100 mt-1">
                    {selectedStaff.last_login ? new Date(selectedStaff.last_login).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the staff account for{" "}
              <span className="font-semibold text-gray-300">{selectedStaff?.full_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete Staff Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
