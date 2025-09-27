// frontend/src/components/Navbar.jsx
import React from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Edit } from 'lucide-react';

const Navbar = () => {
  const { user, isLoaded } = useUser();

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left Side - Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
          <Edit size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Pencil</h1>
      </div>

      {/* Right Side - User Profile */}
      <div className="flex items-center gap-4">
        {isLoaded && user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {user.fullName || user.firstName || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-lg border",
                  userButtonPopoverActionButton: "hover:bg-gray-50"
                }
              }}
              showName={false}
              userProfileMode="navigation"
              userProfileUrl="/user-profile"
            />
          </>
        )}
        
        {isLoaded && !user && (
          <div className="text-sm text-gray-500">
            Loading...
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;