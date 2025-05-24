"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle,
  User,
  Mail,
  Lock,
  Users,
  GraduationCap,
  Briefcase,
  Phone,
  Building,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
    staffId: "",
    studentId: "",
    department: "",
    position: "",
    className: "",
    yearGroup: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    if (formData.role === "staff" && !formData.staffId) {
      setError("Staff ID is required for staff registration")
      setLoading(false)
      return
    }

    if (formData.role === "student" && !formData.studentId) {
      setError("Student ID is required for student registration")
      setLoading(false)
      return
    }

    try {
      const endpoint = formData.role === "staff" ? "/api/auth/register/staff" : "/api/auth/register/student"

      // Prepare data based on role
      const registrationData =
        formData.role === "staff"
          ? {
              staffId: formData.staffId,
              fullName: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              department: formData.department,
              position: formData.position,
              username: formData.username,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
            }
          : {
              studentId: formData.studentId,
              fullName: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              className: formData.className,
              yearGroup: formData.yearGroup,
              username: formData.username,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
            }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(registrationData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Registration successful! You can now login with your credentials.")
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          username: "",
          password: "",
          confirmPassword: "",
          role: "",
          staffId: "",
          studentId: "",
          department: "",
          position: "",
          className: "",
          yearGroup: "",
        })

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(result.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      staffId: "",
      studentId: "",
      department: "",
      position: "",
      className: "",
      yearGroup: "",
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg scale-110"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            School Inventory System
          </h1>
          <p className="text-gray-300 text-lg">Join our academic community</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-700 shadow-2xl animate-slide-up">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-gray-100 text-xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg mr-3">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              Create Your Account
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800 animate-shake">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-900/20 border-green-800 animate-bounce-in">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">{success} Redirecting to login page...</AlertDescription>
                </Alert>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <Label htmlFor="firstName" className="text-gray-300 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-400" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    disabled={loading}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="lastName" className="text-gray-300 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-400" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                    disabled={loading}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-gray-300 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-400" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="phone" className="text-gray-300 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-400" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2 group">
                <Label htmlFor="username" className="text-gray-300 flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-400" />
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                  className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2 group">
                <Label htmlFor="role" className="text-gray-300 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  Role
                </Label>
                <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500">
                    <SelectValue placeholder="Select your role" className="text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="staff" className="text-gray-100 focus:bg-gray-700 focus:text-white">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-blue-400" />
                        Staff Member
                      </div>
                    </SelectItem>
                    <SelectItem value="student" className="text-gray-100 focus:bg-gray-700 focus:text-white">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-purple-400" />
                        Student
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Staff-specific fields */}
              {formData.role === "staff" && (
                <div className="space-y-4 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <Label htmlFor="staffId" className="text-gray-300 flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-blue-400" />
                        Staff ID
                      </Label>
                      <Input
                        id="staffId"
                        name="staffId"
                        type="text"
                        value={formData.staffId}
                        onChange={handleChange}
                        placeholder="Enter your staff ID"
                        required
                        disabled={loading}
                        className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="department" className="text-gray-300 flex items-center">
                        <Building className="h-4 w-4 mr-2 text-blue-400" />
                        Department
                      </Label>
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g., IT, Administration"
                        disabled={loading}
                        className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="position" className="text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                      Position
                    </Label>
                    <Input
                      id="position"
                      name="position"
                      type="text"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g., Teacher, Administrator"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500"
                    />
                  </div>
                </div>
              )}

              {/* Student-specific fields */}
              {formData.role === "student" && (
                <div className="space-y-4 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <Label htmlFor="studentId" className="text-gray-300 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-purple-400" />
                        Student ID
                      </Label>
                      <Input
                        id="studentId"
                        name="studentId"
                        type="text"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="Enter your student ID"
                        required
                        disabled={loading}
                        className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 group-hover:border-gray-500"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="className" className="text-gray-300 flex items-center">
                        <Building className="h-4 w-4 mr-2 text-purple-400" />
                        Class
                      </Label>
                      <Input
                        id="className"
                        name="className"
                        type="text"
                        value={formData.className}
                        onChange={handleChange}
                        placeholder="e.g., Grade 10A"
                        disabled={loading}
                        className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 group-hover:border-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="yearGroup" className="text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                      Year Group
                    </Label>
                    <Input
                      id="yearGroup"
                      name="yearGroup"
                      type="text"
                      value={formData.yearGroup}
                      onChange={handleChange}
                      placeholder="e.g., 2024"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 group-hover:border-gray-500"
                    />
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <Label htmlFor="password" className="text-gray-300 flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-blue-400" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-600/50 text-gray-400 hover:text-gray-200 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="confirmPassword" className="text-gray-300 flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-blue-400" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-600/50 text-gray-400 hover:text-gray-200 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 animate-fade-in-delayed">
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium"
          >
            ← Already have an account? Log in
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.1s both;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
