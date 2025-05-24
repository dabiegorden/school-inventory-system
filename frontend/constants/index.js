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
    title: "Hostels",
    url: "/admin-dashboard/hostels",
    icon: Building,
  },
  {
    id: 3,
    title: "Students",
    url: "/admin-dashboard/students",
    icon: Users,
  },
  {
    id: 4,
    title: "Hostel Owners",
    url: "/admin-dashboard/hostel-owners",
    icon: Users,
  },
  {
    id: 5,
    title: "Bookings",
    url: "/admin-dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    id: 6,
    title: "Payments",
    url: "/admin-dashboard/payments",
    icon: CreditCard,
  },
  {
    id: 7,
    title: "System Settings",
    url: "/admin-dashboard/settings",
    icon: Settings,
  },
];

export const StaffSidebarLinks = [
  {
    id: 1,
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Hostels",
    url: "/admin-dashboard/hostels",
    icon: Building,
  },
  {
    id: 3,
    title: "Students",
    url: "/admin-dashboard/students",
    icon: Users,
  },
  {
    id: 4,
    title: "Hostel Owners",
    url: "/admin-dashboard/hostel-owners",
    icon: Users,
  },
  {
    id: 5,
    title: "Bookings",
    url: "/admin-dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    id: 6,
    title: "Payments",
    url: "/admin-dashboard/payments",
    icon: CreditCard,
  },
  {
    id: 7,
    title: "System Settings",
    url: "/admin-dashboard/settings",
    icon: Settings,
  },
];

export const StudentSidebarLinks = [
  {
    id: 1,
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Hostels",
    url: "/admin-dashboard/hostels",
    icon: Building,
  },
  {
    id: 3,
    title: "Students",
    url: "/admin-dashboard/students",
    icon: Users,
  },
  {
    id: 4,
    title: "Hostel Owners",
    url: "/admin-dashboard/hostel-owners",
    icon: Users,
  },
  {
    id: 5,
    title: "Bookings",
    url: "/admin-dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    id: 6,
    title: "Payments",
    url: "/admin-dashboard/payments",
    icon: CreditCard,
  },
  {
    id: 7,
    title: "System Settings",
    url: "/admin-dashboard/settings",
    icon: Settings,
  },
];
