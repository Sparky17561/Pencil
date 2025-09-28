// components/Navbar.jsx
import React from 'react';
import { UserButton } from '@clerk/clerk-react';

const Navbar = ({ user }) => {
  // Debug logging
  const debugLog = (message, data = null) => {
    console.log(`[Navbar Debug] ${message}`, data || '');
  };

  // Log user state
  React.useEffect(() => {
    debugLog('User state in navbar:', {
      hasUser: !!user,
      userId: user?.id,
      fullName: user?.fullName,
      firstName: user?.firstName,
      lastName: user?.lastName,
      username: user?.username,
      email: user?.primaryEmailAddress?.emailAddress,
      imageUrl: user?.imageUrl
    });
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.assign('/')}
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 transition-all"
            >
              Pencil
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                
                <div className="border-l border-gray-200 pl-4">
                  <UserButton 
                    afterSignOutUrl="/sign-in"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8",
                        userButtonPopoverCard: "shadow-lg border border-gray-200",
                        userButtonPopoverActionButton: "hover:bg-gray-50"
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                Not signed in
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;