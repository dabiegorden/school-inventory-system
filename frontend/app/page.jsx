"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Package, BarChart3, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { UserDropdown } from "@/constants"


export default function HomePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    setIsVisible(true)
  }, [])

  const checkAuth = async () => {
    try {
      // First check localStorage for user data
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      }

      // Then verify with backend
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.authenticated) {
          setUser(data.user)
          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(data.user))
        } else {
          // Clear localStorage if not authenticated
          localStorage.removeItem("user")
          setUser(null)
        }
      } else {
        // Clear localStorage on error
        localStorage.removeItem("user")
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      // Clear localStorage on error
      localStorage.removeItem("user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin opacity-60"></div>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: Package,
      title: "Inventory Tracking",
      description: "Real-time tracking of all school inventory items with low stock alerts",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Role-based access for administrators, staff, and students",
      color: "green",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: BookOpen,
      title: "Request System",
      description: "Streamlined request and approval workflow for inventory items",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Comprehensive reporting for better decision making",
      color: "orange",
      gradient: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-lg shadow-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex justify-between items-center py-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg scale-110"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full shadow-lg">
                  <BookOpen className="h-6 w-6 text-white transition-all duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  SIM
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {["Home", "About", "Contact"].map((item, index) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className={`text-gray-300 hover:text-blue-400 transition-all duration-300 hover:scale-105 font-medium relative group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}

              {/* Conditional rendering based on user authentication */}
              {user ? (
                <UserDropdown user={user} onLogout={handleLogout} />
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className={`border-2 border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:shadow-lg hover:scale-105 transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    style={{ transitionDelay: "400ms" }}
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-gray-700">
            <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
            <span className="text-blue-300 font-medium text-sm">Next-Generation Inventory Management</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-100 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Inventory Management
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              for Amoaya Senior High School
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Streamline your school's inventory management with our comprehensive system. Track items, manage requests,
            and generate reports efficiently with cutting-edge technology.
          </p>
        </div>

        {/* Features Grid */}
        <div
          className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={`text-center group cursor-pointer border-0 bg-gray-800/70 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <CardHeader className="relative z-10">
                  <div className="relative mb-4">
                    <Icon
                      className={`h-12 w-12 mx-auto transition-all duration-500 group-hover:scale-110 ${
                        feature.color === "blue"
                          ? "text-blue-400 group-hover:text-blue-300"
                          : feature.color === "green"
                            ? "text-green-400 group-hover:text-green-300"
                            : feature.color === "purple"
                              ? "text-purple-400 group-hover:text-purple-300"
                              : "text-orange-400 group-hover:text-orange-300"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${
                        feature.color === "blue"
                          ? "bg-blue-400"
                          : feature.color === "green"
                            ? "bg-green-400"
                            : feature.color === "purple"
                              ? "bg-purple-400"
                              : "bg-orange-400"
                      }`}
                    ></div>
                  </div>
                  <CardTitle className="transition-all duration-300 group-hover:text-gray-100 text-gray-200">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="transition-all duration-300 group-hover:text-gray-300 text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                {hoveredCard === index && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                    <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* CTA Section - Only show if user is not logged in */}
        {!user && (
          <div
            className={`text-center transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Card className="max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-sm border border-gray-700 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-3xl bg-gradient-to-r from-gray-100 to-blue-300 bg-clip-text text-transparent">
                  Get Started Today
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Access the inventory management system with your credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group/btn relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Login to System
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      Create Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Welcome message for logged in users */}
        {user && (
          <div
            className={`text-center transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Card className="max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-sm border border-gray-700 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-3xl bg-gradient-to-r from-gray-100 to-blue-300 bg-clip-text text-transparent">
                  Welcome back, {user.name || user.username}!
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  You're logged in as {user.userType}. Access your dashboard to manage inventory.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Link
                  href={
                    user.userType === "admin"
                      ? "/admin/dashboard"
                      : user.userType === "staff"
                        ? "/staff/dashboard"
                        : user.userType === "student"
                          ? "/student/dashboard"
                          : "/dashboard"
                  }
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group/btn relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`bg-gray-800/80 backdrop-blur-lg border-t border-gray-700 mt-16 transition-all duration-1000 delay-1200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="hover:text-gray-300 transition-colors duration-300">
              &copy; 2024 Catholic University of Ghana. All rights reserved.
            </p>
            <p className="mt-2 hover:text-gray-300 transition-colors duration-300">
              Developed by: Richard Ntori, Benieh Fordjour Nana, Ramos Danso Gomez
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
