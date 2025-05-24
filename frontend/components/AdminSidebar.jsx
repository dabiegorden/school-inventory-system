"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { AdminSidebarLinks } from '@/constants';


const AdminSidebar = ({ toggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Implement logout functionality
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for sending cookies
      });

      if (response.ok) {
        // Close sidebar on mobile if needed
        if (toggleSidebar && window.innerWidth < 768) {
          toggleSidebar();
        }
        
        // Redirect to hostel owner login page
        router.push("/home");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-indigo-800 to-indigo-900 text-white shadow-xl">
      {/* Sidebar Content */}
      <div className="flex-1 py-6 h-full overflow-y-auto">
        <nav className="px-3 space-y-2">
          {AdminSidebarLinks.map((item) => {
            const isActive = pathname === item.url || (pathname && pathname.startsWith(`${item.url}/`));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.id} 
                href={item.url}
                onClick={() => {
                  if (toggleSidebar && window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}
                  transition-all duration-200 transform hover:translate-x-1
                `}
              >
                <Icon 
                  className={`
                    mr-3 flex-shrink-0 h-5 w-5 
                    ${isActive ? 'text-indigo-200' : 'text-indigo-300 group-hover:text-white'}
                  `} 
                />
                {item.title}
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-indigo-700">
            <button 
              className="flex items-center w-full px-4 py-3 cursor-pointer text-sm font-medium rounded-lg text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;