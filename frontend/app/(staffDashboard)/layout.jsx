"use client";

import React, { useState, useEffect } from 'react';
import { StaffNavbar, StaffSidebar } from '@/constants';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="flex h-screen w-screen overflow-hidden relative z-10">
        {/* Mobile Navbar with hamburger menu */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30">
          <div className="flex justify-between items-center bg-gray-800/90 backdrop-blur-lg border-b border-gray-700 h-16 px-4 shadow-lg">
            <button
              onClick={toggleSidebar}
              className="text-gray-300 hover:text-white focus:outline-none transition-colors duration-300 p-2 rounded-lg hover:bg-gray-700/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 px-4">
              <StaffNavbar isMobile={true} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 md:pt-0 pt-16">
          {/* Sidebar - permanent on desktop, overlay on mobile */}
          <aside
            className={`
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0
              transition-all duration-500 ease-in-out
              fixed md:relative top-0 md:top-0 left-0 z-40 md:z-0
              w-64 h-screen md:h-screen
              bg-gray-800/90 backdrop-blur-lg border-r border-gray-700
              shadow-2xl md:shadow-lg
              flex flex-col
              ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-center md:justify-start items-center h-16 px-3 md:px-4 border-b border-gray-700 bg-gradient-to-r  from-gray-900 via-gray-800 to-slate-900 backdrop-blur-sm relative overflow-hidden group">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center space-x-3 relative z-10">
                  {/* Logo placeholder - uncomment and adjust as needed */}
                  {/* <div className="relative">
                    <Image src={cugLogo} alt="logo" width={28} height={28} className="w-6 h-6 md:w-7 md:h-7" />
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
                  </div> */}
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    AP
                  </div>
                  <h1 className="text-sm sm:text-base md:text-xl font-bold text-white truncate group-hover:text-blue-100 transition-colors duration-300">
                    Staff Portal
                  </h1>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-800/70 backdrop-blur-sm">
                <StaffSidebar toggleSidebar={toggleSidebar} />
              </div>
            </div>
          </aside>
          
          {/* Mobile overlay when sidebar is open */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
              onClick={toggleSidebar}
            />
          )}
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Desktop navbar - full width */}
            <header className="hidden md:block sticky top-0 z-20 h-16">
                <StaffNavbar />
              <div className="bg-gray-800/90 backdrop-blur-lg border-b border-gray-700 shadow-lg">
              </div>
            </header>
            
            {/* Page content - this is the only part that should scroll */}
            <main className={`flex-1 overflow-y-auto p-4 h-[calc(100vh-4rem)] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="container mx-auto">
                {/* Content wrapper with glassmorphism effect */}
                <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl min-h-full relative overflow-hidden">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none"></div>
                  <div className="relative z-10 p-6">
                    {children}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;