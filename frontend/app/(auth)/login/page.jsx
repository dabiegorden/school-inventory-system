"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Eye, EyeOff, LogIn, User, Lock, ArrowRight, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Client-side validation
    if (!formData.username || !formData.password || !formData.userType) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          userType: formData.userType,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Login successful! Redirecting to dashboard...")

        // Store user info in localStorage for client-side access
        localStorage.setItem("user", JSON.stringify(result.user))

        // Redirect based on user type after a short delay
        setTimeout(() => {
          switch (result.user.userType) {
            case "admin":
              router.push("/")
              break
            case "staff":
              router.push("/")
              break
            case "student":
              router.push("/")
              break
            default:
              router.push("/");
          }
        }, 1500)
      } else {
        setError(result.message || "Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error("Login error:", error)
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

  const handleUserTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      userType: value,
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

      <div className="w-full max-w-md relative z-10">
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
          <p className="text-gray-300 text-lg">Welcome back to your dashboard</p>
        </div>

        {/* Login Form */}
        <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-700 shadow-2xl animate-slide-up">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-gray-100 text-xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg mr-3">
                <LogIn className="h-5 w-5 text-white" />
              </div>
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Enter your credentials to access the system
            </CardDescription>
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
                  <AlertDescription className="text-green-300">{success}</AlertDescription>
                </Alert>
              )}

              {/* User Type Selection */}
              <div className="space-y-2 group">
                <Label htmlFor="userType" className="text-gray-300 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  Login As
                </Label>
                <Select value={formData.userType} onValueChange={handleUserTypeChange} disabled={loading}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500 h-12">
                    <SelectValue placeholder="Select your role" className="text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="admin" className="text-gray-100 focus:bg-gray-700 focus:text-white">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-red-400" />
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="staff" className="text-gray-100 focus:bg-gray-700 focus:text-white">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-blue-400" />
                        Staff Member
                      </div>
                    </SelectItem>
                    <SelectItem value="student" className="text-gray-100 focus:bg-gray-700 focus:text-white">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-400" />
                        Student
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Username/Email Field */}
              <div className="space-y-2 group">
                <Label htmlFor="username" className="text-gray-300 flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-400" />
                  Username or ID
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={
                    formData.userType === "staff"
                      ? "Enter username or staff ID"
                      : formData.userType === "student"
                        ? "Enter username or student ID"
                        : "Enter your username"
                  }
                  required
                  disabled={loading}
                  className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500 h-12"
                />
              </div>

              {/* Password Field */}
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
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-500 pr-12 h-12"
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

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 space-y-3 animate-fade-in-delayed">
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium group inline-flex items-center"
          >
            Don't have an account?
            <span className="text-blue-300 ml-1 group-hover:underline">Register Now</span>
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
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
