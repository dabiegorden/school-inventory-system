"use client"

import { useState } from "react"
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
import { User, Mail, Shield, BadgeIcon as IdCard, LayoutDashboard, LogOut, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

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

        // Call parent logout handler
        if (onLogout) {
          onLogout()
        }

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
    switch (user?.userType) {
      case "admin":
        return "/admin-dashboard"
      case "staff":
        return "/staff-dashboard"
      case "student":
        return "/student-dashboard"
      default:
        return "/"
    }
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
    return user?.username?.slice(0, 2).toUpperCase() || "U"
  }

  const getRoleColor = () => {
    switch (user?.userType) {
      case "admin":
        return "text-red-400"
      case "staff":
        return "text-blue-400"
      case "student":
        return "text-purple-400"
      default:
        return "text-gray-400"
    }
  }

  const getRoleIcon = () => {
    switch (user?.userType) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-400" />
      case "staff":
        return <User className="h-4 w-4 text-blue-400" />
      case "student":
        return <User className="h-4 w-4 text-purple-400" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const getUserId = () => {
    if (user?.userType === "staff" && user?.staffId) {
      return user.staffId
    }
    if (user?.userType === "student" && user?.studentId) {
      return user.studentId
    }
    return user?.username || "N/A"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-2 h-auto bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 transition-all duration-200"
        >
          <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-gray-200 font-medium text-sm">{user?.name || user?.username}</span>
            <span className={`text-xs capitalize ${getRoleColor()}`}>{user?.userType}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-gray-800 border-gray-700 shadow-xl" sideOffset={5}>
        <DropdownMenuLabel className="px-4 py-3 bg-gray-750">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-gray-100 font-semibold">{user?.name || user?.username}</span>
              <span className={`text-sm capitalize ${getRoleColor()}`}>{user?.userType}</span>
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
            {getRoleIcon()}
            <span className="text-gray-300 capitalize">{user?.userType}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <IdCard className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">{getUserId()}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Dashboard Link */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link
            href={getDashboardLink()}
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

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
  )
}
