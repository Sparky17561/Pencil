// src/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500"
            >
              Pencil
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Add extra nav items here if needed */}
            <div className="ml-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
