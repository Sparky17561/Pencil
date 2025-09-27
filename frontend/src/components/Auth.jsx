// frontend/src/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Auth = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setIsSigningIn(true);
    console.log('Initiating Google OAuth flow...');

    try {
      // In a real app, this would redirect to the Django backend's Google OAuth URL.
      // Example: window.location.href = 'http://localhost:8000/auth/google';

      // For this example, we'll simulate the process with a delay.
      await new Promise(resolve => setTimeout(resolve, 2000));

      // After successful authentication, the backend redirects back to the frontend
      // with a token. We'd store this token (e.g., in localStorage) and then
      // navigate to the main application.
      console.log('Google OAuth successful! Simulating redirect to app...');
      
      // Navigate to the main app component
      navigate('/app');

    } catch (error) {
      console.error('Google OAuth failed:', error);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full text-center border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-sky-500">
          Sign in to Pencil
        </h2>
        <p className="text-gray-400 mb-8">
          Unlock the full power of AI-generated diagrams.
        </p>
        <button
          onClick={handleGoogleAuth}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center px-6 py-3 font-semibold text-white rounded-lg transition-all duration-300 ease-in-out bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningIn ? (
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <FaGoogle className="mr-3" />
          )}
          <span>{isSigningIn ? 'Redirecting...' : 'Sign in with Google'}</span>
        </button>
      </div>
    </div>
  );
};

export default Auth;