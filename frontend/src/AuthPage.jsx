// src/AuthPage.jsx
import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';

const AuthPage = () => {
  const [mode, setMode] = useState('signIn'); // 'signIn' | 'signUp'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Pencil</h2>
          <p className="text-gray-400">Sign in or sign up to start creating flowcharts with AI.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {mode === 'signIn' ? (
            <SignIn routing="path" path="/auth" forceRedirectUrl="/app" />
          ) : (
            <SignUp routing="path" path="/auth" forceRedirectUrl="/app" />
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
              className="text-sm text-blue-600 hover:underline"
            >
              {mode === 'signIn' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
