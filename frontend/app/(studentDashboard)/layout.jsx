"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { StudentNavbar, StudentSidebar } from '@/constants';

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Mobile Navbar with hamburger menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30">
        <div className="flex justify-between items-center bg-gradient-to-r from-gray-800/90 via-gray-800/70 to-gray-900/90 backdrop-blur-lg h-16 px-4 shadow-2xl border-b border-gray-600/30 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-2 right-10 w-8 h-8 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-2 left-10 w-6 h-6 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-gray-700/60 
                       transition-all duration-300 transform hover:scale-105 relative z-10 group"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 relative z-10">
            <StudentNavbar isMobile={true} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 md:pt-0 pt-16">
        {/* Sidebar - permanent on desktop, overlay on mobile */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            transition-transform duration-300 ease-in-out
            fixed md:relative top-0 md:top-0 left-0 z-40 md:z-0
            w-64 h-screen md:h-screen
            bg-gradient-to-b from-gray-800/90 via-gray-800/70 to-gray-900/90 backdrop-blur-lg shadow-2xl md:shadow-2xl
            flex flex-col border-r border-gray-600/30  overflow-hidden
          `}
        >
          {/* Subtle background pattern for sidebar */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-5 w-16 h-16 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 left-5 w-12 h-12 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="flex flex-col h-full relative z-10">
            <div className="flex justify-center md:justify-start items-center h-16 px-3 md:px-4 border-b border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 text-white relative overflow-hidden">
              {/* Header background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-5 w-8 h-8 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
              </div>
              
              <div className="flex items-center space-x-2 relative z-10">
                {/* Logo with glow effect */}
                <div className="relative">
                  {/* <Image src={cugLogo} alt="logo" width={24} height={24} className="w-6 h-6 md:w-7 md:h-7" /> */}
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    SP
                  </div>
                  <div className="absolute inset-0 rounded-lg bg-blue-400/30 blur-lg"></div>
                </div>
                <h1 className="text-sm sm:text-base md:text-xl font-bold truncate text-white">Staff Portal</h1>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <StudentSidebar toggleSidebar={toggleSidebar} />
            </div>
          </div>
        </aside>
        
        {/* Mobile overlay when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop navbar - full width */}
          <header className="hidden md:block sticky top-0 z-20 h-16">
            <StudentNavbar />
          </header>
          
          {/* Page content - this is the only part that should scroll */}
          <main className="flex-1 overflow-y-auto p-4 h-[calc(100vh-4rem)] relative">
            {/* Main content background with subtle pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            <div className="container mx-auto relative z-10">
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl border border-gray-600/30 shadow-2xl p-1 relative overflow-hidden">
                {/* Content container background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-5 right-5 w-16 h-16 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-5 left-5 w-12 h-12 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1500"></div>
                </div>
                
                <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 relative z-10">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;