"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Building, LogOut, Mail, Phone, Briefcase, Clock, MapPinned } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const StudentNavbar = ({ isMobile }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileMenuRef = useRef(null);
  const router = useRouter();

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for sending cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.role === "hostel-owner") {
            // Fetch complete hostel owner profile
            const profileResponse = await fetch(
              "http://localhost:5000/api/hostel-owners/profile",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              }
            );

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setUser(profileData.hostelOwner);
            } else {
              // If profile fetch fails, use basic session data
              setUser(data.user);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Implement logout functionality
  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        // Clear the user state
        setUser(null);
        // Close any open menus
        setProfileMenuOpen(false);
        // Redirect to login page
        router.push("/home");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <nav className="w-full bg-gradient-to-b from-gray-800/90 via-gray-800/70 to-gray-900/90 backdrop-blur-lg py-3 px-6 h-full flex items-center justify-end shadow-2xl border-b border-gray-600/30 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-2 right-10 w-8 h-8 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-2 left-10 w-6 h-6 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="space-x-4 relative z-10">
        {loading ? (
          <div className="text-sm text-white">Loading...</div>
        ) : user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              className="flex items-center cursor-pointer text-sm gap-2 font-medium text-white hover:text-gray-100 focus:outline-none transition-all duration-300 transform hover:scale-105 p-2 rounded-lg hover:bg-gray-700/60"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-full relative">
                <Building className="size-5" />
                <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-lg"></div>
              </div>
              <span>{user.name || "Hostel Owner"}</span>
              <ChevronDown className={`w-4 h-4 text-white ${profileMenuOpen ? 'transform rotate-180' : ''} transition-transform duration-200`} />
            </button>
            
            {profileMenuOpen && (
              <div className="absolute right-0 z-10 mt-3 w-80 overflow-hidden rounded-lg bg-gradient-to-b from-gray-800/90 via-gray-800/70 to-gray-900/90 backdrop-blur-lg ring-1 shadow-2xl ring-gray-600/50 border border-gray-600/30">
                {/* Background pattern for dropdown */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-5 right-5 w-16 h-16 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-5 left-5 w-12 h-12 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1500"></div>
                </div>
                
                <div className="p-4 relative z-10">
                  <div className="border-b border-gray-600/50 pb-3 mb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-full relative">
                        <Building className="size-6" />
                        <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-lg"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-gray-300">Hostel Owner</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-gray-300" />
                      <span className="text-white">{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="size-4 text-gray-300" />
                        <span className="text-white">{user.phoneNumber}</span>
                      </div>
                    )}
                    {user.businessName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="size-4 text-gray-300" />
                        <span className="text-white">{user.businessName}</span>
                      </div>
                    )}
                    {user.businessAddress && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPinned className="size-4 text-gray-300" />
                        <span className="text-white">{user.businessAddress}</span>
                      </div>
                    )}
                    {user.createdAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-gray-300" />
                        <span className="text-white">
                          Joined: {formatDate(user.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-600/50 pt-3 space-y-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-semibold text-white hover:text-red-200 w-full py-2 cursor-pointer transition-all duration-300 p-2 rounded-lg hover:bg-gray-700/60"
                    >
                      <LogOut className="size-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link 
            href="/hostel-owners/signin"
            className="text-sm font-medium text-white hover:text-gray-100 transition-all duration-300 p-2 rounded-lg hover:bg-gray-700/60"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default StudentNavbar;