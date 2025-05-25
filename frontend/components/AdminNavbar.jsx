"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Mail, Shield, BadgeIcon as IdCard, LayoutDashboard, LogOut, ChevronDown, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const AdminNavbar = ({ isMobile }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // First check localStorage for user data
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          if (userData.userType === "admin") {
            setUser(userData)
          }
        }

        // Then verify with backend
        const response = await fetch("/api/auth/check", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.authenticated && data.user.userType === "admin") {
            setUser(data.user)
            // Update localStorage with fresh data
            localStorage.setItem("user", JSON.stringify(data.user))
          } else {
            // Clear localStorage if not authenticated as admin
            localStorage.removeItem("user")
            setUser(null)
            router.push("/login")
          }
        } else {
          // Clear localStorage on error
          localStorage.removeItem("user")
          setUser(null)
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
        // Clear localStorage on error
        localStorage.removeItem("user")
        setUser(null)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        // Clear local storage
        localStorage.removeItem("user")
        // Clear user state
        setUser(null)
        // Redirect to home page
        router.push("/")
      } else {
        console.error("Logout failed:", result.message)
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getDashboardLink = () => {
    return "/admin/dashboard"
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.username?.slice(0, 2).toUpperCase() || "A"
  }

  const getUserId = () => {
    return user?.adminId || user?.username || "N/A"
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <nav className="w-full bg-gradient-to-b from-gray-800/90 via-gray-800/70 to-gray-900/90 backdrop-blur-lg py-3 px-6 h-full flex items-center justify-end shadow-2xl relative overflow-hidden">
      {/* Subtle background pattern - matching sidebar */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-2 right-10 w-16 h-16 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-2 left-10 w-12 h-12 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="space-x-4 relative z-10">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-300">Loading...</span>
          </div>
        ) : user ? (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 h-auto bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 transition-all duration-200"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-r from-red-500 to-red-600">
                  <AvatarFallback className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-gray-200 font-medium text-sm">{user?.name || user?.username}</span>
                  <span className="text-xs text-red-400 capitalize">Administrator</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-gray-800 border-gray-700 shadow-xl" sideOffset={5}>
              <DropdownMenuLabel className="px-4 py-3 bg-gray-750">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-r from-red-500 to-red-600">
                    <AvatarFallback className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-gray-100 font-semibold">{user?.name || user?.username}</span>
                    <span className="text-sm text-red-400 capitalize">Administrator</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-gray-700" />

              {/* User Information */}
              <div className="px-4 py-2 space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{user?.email || "No email"}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-red-400" />
                  <span className="text-gray-300">Administrator</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <IdCard className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{getUserId()}</span>
                </div>

                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{user.phone}</span>
                  </div>
                )}

                {user?.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">Joined: {formatDate(user.createdAt)}</span>
                  </div>
                )}
              </div>

              <DropdownMenuSeparator className="bg-gray-700" />

              {/* Logout */}
              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:text-red-300 focus:bg-red-900/20"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3 px-1 py-1">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 rounded-xl
                       hover:bg-gray-700/60 hover:backdrop-blur-sm border border-transparent hover:border-gray-600/30
                       transition-all duration-500 transform hover:scale-105"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}

export default AdminNavbar
