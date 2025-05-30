import AdminNavbar from "@/components/AdminNavbar";
import AdminSidebar from "@/components/AdminSidebar";
import StaffNavbar from "@/components/StaffNavbar";
import StaffSidebar from "@/components/StaffSidebar";
import StudentNavbar from "@/components/StudentNavbar";
import StudentSidebar from "@/components/StudentSidebar";
import UserDropdown from "@/components/user-dropdown";

export{
    AdminNavbar,
    AdminSidebar,
    StaffNavbar,
    StaffSidebar,
    StudentNavbar,
    StudentSidebar,
    UserDropdown
}

import {
  LayoutDashboard,
  Building,
  Users,
  CalendarCheck,
  CreditCard,
  Star,
  Settings,
  Boxes,
  ClipboardList,
  LogOut
} from "lucide-react";


// Sidebar links for the admin dashboard
export const AdminSidebarLinks = [
  {
    id: 1,
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Inventory",
    url: '/admin-dashboard/inventory',
    icon: Boxes,
  },
  {
    id: 3,
    title: "Students",
    url: "/admin-dashboard/students",
    icon: Users,
  },
  {
    id: 4,
    title: "Staff",
    url: "/admin-dashboard/staff",
    icon: Users,
  },
  {
    id: 5,
    title: "Requests",
    url: '/admin-dashboard/requests',
    icon: ClipboardList,
  },
  {
    id: 6,
    title: "Reports",
    url: '/admin-dashboard/reports',
    icon: CalendarCheck,
  },
  {
    id: 7,
    title: "Settings",
    url: "/admin-dashboard/settings",
    icon: Settings,
  },
];

export const StaffSidebarLinks = [
  {
    id: 1,
    title: "Dashboard",
    url: "/staff-dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Inventory",
    url: "/staff-dashboard/inventory",
    icon: Boxes,
  },
  {
    id: 3,
    title: "Requests",
    url: "/staff-dashboard/requests",
    icon: ClipboardList,
  },
  {
    id: 4,
    title: "System Settings",
    url: "/staff-dashboard/settings",
    icon: Settings,
  },
];

export const StudentSidebarLinks = [
  {
    id: 1,
    title: "Dashboard",
    url: "/student-dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "My Requests",
    url: "/student-dashboard/requests",
    icon: Building,
  },
  {
    id: 8,
    title: "System Settings",
    url: "/student-dashboard/settings",
    icon: Settings,
  },
];
