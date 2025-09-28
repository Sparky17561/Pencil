// components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/clerk-react';

const Navbar = ({ user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate title on mount
  useEffect(() => {
    setAnimateTitle(true);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/20' 
          : 'bg-gradient-to-r from-slate-900/90 via-gray-900/90 to-slate-900/90 backdrop-blur-lg shadow-xl shadow-black/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          
          {/* Left Section - Elegant Brand */}
          <div className="flex items-center">
            <button
              onClick={() => window.location.assign('/')}
              className="group flex items-center space-x-4 transition-all duration-300 hover:scale-105"
            >
              {/* Elegant Logo - Pencil Icon */}
              <div className="relative">
                <div className="w-10 h-10 flex items-center justify-center transform transition-all duration-300 group-hover:rotate-12">
                  {/* Custom Pencil SVG */}
                  <svg 
                    className="w-8 h-8 text-white drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                  >
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="M2 2l7.586 7.586"/>
                    <circle cx="11" cy="11" r="2"/>
                  </svg>
                  {/* Floating sparkle effect */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                </div>
              </div>
              
              {/* Brand Typography */}
              <div className="flex flex-col">
                <h1 className={`text-2xl font-bold text-white transition-all duration-700 tracking-tight ${
                  animateTitle ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                } group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-pink-400`}>
                  Pencil
                </h1>
                <p className="text-xs text-gray-300 font-medium -mt-1 tracking-wide group-hover:text-gray-200 transition-colors duration-300">
                  Flow Designer
                </p>
              </div>
            </button>
          </div>

          {/* Right Section - User Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info with Elegant Typography */}
                <div className="hidden sm:flex flex-col items-end">
                  <div className="text-sm font-semibold text-white">
                    {user.firstName || user.username || 'User'}
                  </div>
                  <div className="text-xs text-gray-300 font-medium">
                    {user.primaryEmailAddress?.emailAddress || 'Signed In'}
                  </div>
                </div>
                
                {/* Enhanced User Button */}
                <div className="relative group">
                  {/* Glowing ring effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-30 blur transition-all duration-500"></div>
                  {/* Inner glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-60 blur-sm transition-all duration-300"></div>
                  
                  <UserButton 
                    afterSignOutUrl="/sign-in"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-10 h-10 shadow-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300 transform group-hover:scale-110",
                        userButtonPopoverCard: "shadow-2xl border border-gray-700 backdrop-blur-xl bg-gray-900/95",
                        userButtonPopoverActionButton: "hover:bg-gray-800 transition-colors duration-200 text-gray-200 hover:text-white",
                        userButtonPopoverActionButtonText: "text-gray-200"
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Elegant loading spinner */}
                <div className="relative">
                  <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                </div>
                <span className="text-sm text-gray-300 font-medium">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Elegant bottom accent */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      </div>
    </header>
  );
};

export default Navbar;