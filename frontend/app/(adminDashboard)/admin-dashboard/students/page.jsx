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
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Filter, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

// Fixed: Move form component outside to prevent recreation
const StudentForm = ({ onSubmit, submitText, formData, handleInputChange, submitting, selectedStudent }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="studentId">Student ID</Label>
        <Input
          id="studentId"
          value={formData.studentId || ""}
          onChange={(e) => handleInputChange("studentId", e.target.value)}
          placeholder="Enter student ID"
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
        <Label htmlFor="className">Class</Label>
        <Input
          id="className"
          value={formData.className || ""}
          onChange={(e) => handleInputChange("className", e.target.value)}
          placeholder="e.g., Grade 10A"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="yearGroup">Year Group</Label>
        <Input
          id="yearGroup"
          value={formData.yearGroup || ""}
          onChange={(e) => handleInputChange("yearGroup", e.target.value)}
          placeholder="e.g., 2024"
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
          required={!selectedStudent}
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

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    phone: "",
    className: "",
    yearGroup: "",
    username: "",
    password: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const searchParams = useSearchParams()

  useEffect(() => {
    fetchStudents()

    if (searchParams.get("action") === "add") {
      setIsAddDialogOpen(true)
    }
  }, [searchParams])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/students", {
        credentials: "include",
      })
      const result = await response.json()

      if (result.success) {
        setStudents(result.data)
      } else {
        toast.error("Failed to fetch students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Error loading students")
    } finally {
      setLoading(false)
    }
  }

  // Fixed: Use useCallback to prevent function recreation
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Student added successfully")
        setIsAddDialogOpen(false)
        resetForm()
        fetchStudents()
      } else {
        toast.error(result.message || "Failed to add student")
      }
    } catch (error) {
      console.error("Error adding student:", error)
      toast.error("Error adding student")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditStudent = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          className: formData.className,
          yearGroup: formData.yearGroup,
          status: "active",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Student updated successfully")
        setIsEditDialogOpen(false)
        resetForm()
        fetchStudents()
      } else {
        toast.error(result.message || "Failed to update student")
      }
    } catch (error) {
      console.error("Error updating student:", error)
      toast.error("Error updating student")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStudent = async () => {
    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Student deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedStudent(null)
        fetchStudents()
      } else {
        toast.error(result.message || "Failed to delete student")
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Error deleting student")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      fullName: "",
      email: "",
      phone: "",
      className: "",
      yearGroup: "",
      username: "",
      password: "",
    })
    setSelectedStudent(null)
  }

  const openEditDialog = (student) => {
    setSelectedStudent(student)
    setFormData({
      studentId: student.student_id || "",
      fullName: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      className: student.class || "",
      yearGroup: student.year_group || "",
      username: student.username || "",
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (student) => {
    setSelectedStudent(student)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (student) => {
    setSelectedStudent(student)
    setIsDeleteDialogOpen(true)
  }

  const filteredStudents = students.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Students Management
          </h1>
          <p className="text-gray-400 mt-1">Manage student accounts and information</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchStudents} variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Add New Student</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new student account with their details
                </DialogDescription>
              </DialogHeader>
              <StudentForm
                onSubmit={handleAddStudent}
                submitText="Add Student"
                formData={formData}
                handleInputChange={handleInputChange}
                submitting={submitting}
                selectedStudent={selectedStudent}
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
                placeholder="Search students by name, ID, email, or class..."
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

      {/* Students Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Students ({filteredStudents.length})
          </CardTitle>
          <CardDescription className="text-gray-400">Manage all student accounts and their information</CardDescription>
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
                  <TableHead className="text-gray-300">Student ID</TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Class</TableHead>
                  <TableHead className="text-gray-300">Year Group</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="border-gray-700 hover:bg-gray-700/30">
                    <TableCell className="text-gray-300 font-medium">{student.student_id}</TableCell>
                    <TableCell className="text-gray-300">{student.full_name}</TableCell>
                    <TableCell className="text-gray-300">{student.email}</TableCell>
                    <TableCell className="text-gray-300">{student.class || "N/A"}</TableCell>
                    <TableCell className="text-gray-300">{student.year_group || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>
                        {student.status === "active" ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => openViewDialog(student)} className="text-gray-300">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(student)} className="text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(student)}
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

          {!loading && filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Edit Student</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update student information and account details
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            onSubmit={handleEditStudent}
            submitText="Update Student"
            formData={formData}
            handleInputChange={handleInputChange}
            submitting={submitting}
            selectedStudent={selectedStudent}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Student Details</DialogTitle>
            <DialogDescription className="text-gray-400">View complete student information</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Student ID</Label>
                  <p className="text-gray-100 mt-1">{selectedStudent.student_id}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Full Name</Label>
                  <p className="text-gray-100 mt-1">{selectedStudent.full_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <p className="text-gray-100 mt-1">{selectedStudent.email}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <p className="text-gray-100 mt-1">{selectedStudent.phone || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Class</Label>
                  <p className="text-gray-100 mt-1">{selectedStudent.class || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Year Group</Label>
                  <p className="text-gray-100 mt-1">{selectedStudent.year_group || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Username</Label>
                  <p className="text-gray-100 mt-1">{selectedStudent.username}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Badge variant={selectedStudent.status === "active" ? "default" : "secondary"} className="mt-1">
                    {selectedStudent.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Created At</Label>
                  <p className="text-gray-100 mt-1">{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Last Login</Label>
                  <p className="text-gray-100 mt-1">
                    {selectedStudent.last_login ? new Date(selectedStudent.last_login).toLocaleDateString() : "Never"}
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
              This action cannot be undone. This will permanently delete the student account for{" "}
              <span className="font-semibold text-gray-300">{selectedStudent?.full_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
