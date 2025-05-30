"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ChevronRight } from 'lucide-react';
import { StaffSidebarLinks } from '@/constants';

const StaffSideBarPage = ({ toggleSidebar, onLogout  }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Implement logout functionality
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

        if (toggleSidebar && window.innerWidth < 768) {
          toggleSidebar();
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

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-gray-800/90 via-gray-800/70 to-gray-900/90 backdrop-blur-lg text-white shadow-2xl relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Sidebar Content */}
      <div className="flex-1 py-6 h-full overflow-y-auto relative z-10">
        <nav className="px-3 space-y-1">
          {StaffSidebarLinks.map((item, index) => {
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
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl
                  transition-all duration-500 transform relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg backdrop-blur-sm border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-gray-700/60 hover:text-white hover:backdrop-blur-sm hover:border-gray-600/30 border border-transparent'}
                  hover:scale-105 hover:translate-x-2
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Gradient overlay for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
                )}
                
                {/* Hover glow effect */}
                {hoveredItem === index && !isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded-xl transition-opacity duration-300"></div>
                )}
                
                <div className="flex items-center relative z-10">
                  <div className="relative mr-3">
                    <Icon 
                      className={`
                        flex-shrink-0 h-5 w-5 transition-all duration-300
                        ${isActive 
                          ? 'text-blue-200' 
                          : 'text-gray-400 group-hover:text-white'}
                        group-hover:scale-110
                      `} 
                    />
                    {/* Icon glow effect */}
                    {(isActive || hoveredItem === index) && (
                      <div className={`absolute inset-0 rounded-full blur-lg transition-all duration-300 ${
                        isActive ? 'bg-blue-400/30' : 'bg-gray-400/20'
                      }`}></div>
                    )}
                  </div>
                  <span className="group-hover:text-white transition-colors duration-300">
                    {item.title}
                  </span>
                </div>
                
                {/* Arrow indicator for active/hover state */}
                <ChevronRight 
                  className={`
                    h-4 w-4 transition-all duration-300 relative z-10
                    ${isActive || hoveredItem === index 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-2'}
                    ${isActive ? 'text-blue-200' : 'text-gray-400'}
                  `}
                />
              </Link>
            );
          })}

          {/* Logout Section */}
          <div className="pt-6 mt-6 relative">
            {/* Divider with gradient */}
            <div className="absolute top-3 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            
            <button 
              className="flex items-center justify-between w-[70%] px-4 py-3 cursor-pointer text-sm font-medium rounded-xl 
                         text-red-300 hover:bg-gradient-to-r hover:from-red-600/80 hover:to-red-700/80 
                         hover:text-white transition-all duration-500 transform hover:scale-105 hover:translate-x-2
                         border border-transparent hover:border-red-500/30 hover:shadow-lg relative overflow-hidden group"
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Hover glow effect */}
              {hoveredItem === 'logout' && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-xl transition-opacity duration-300"></div>
              )}
              
              <div className="flex items-center relative z-10">
                <div className="relative mr-3">
                  <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  {/* Icon glow effect */}
                  {hoveredItem === 'logout' && (
                    <div className="absolute inset-0 rounded-full bg-red-400/30 blur-lg transition-all duration-300"></div>
                  )}
                </div>
                <span>Logout</span>
              </div>
              
              {/* Arrow indicator */}
              <ChevronRight 
                className={`
                  h-4 w-4 transition-all duration-300 relative z-10
                  ${hoveredItem === 'logout' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                `}
              />
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default StaffSideBarPage;