// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useAuth,
} from '@clerk/clerk-react';

import App from './App';
import './index.css';

// Clerk publishable key from env
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

if (!clerkPublishableKey) {
  console.warn('Clerk publishable key missing. Set VITE_CLERK_PUBLISHABLE_KEY in your .env');
}

/*
  Full-screen Auth Layout
  Ensures the Clerk SignIn / SignUp UI occupies the central area fully and doesn't sit
  in a small left-aligned box. This layout gives the auth component space and a nice glass UI.
*/
const AuthFullScreenLayout = ({ children, title = '' }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-teal-50 p-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left - visual brand / copy */}
          <div className="rounded-3xl p-8 flex flex-col justify-center gap-6"
               style={{
                 background: 'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.65))',
                 backdropFilter: 'blur(8px)',
                 border: '1px solid rgba(255,255,255,0.6)',
                 boxShadow: '0 20px 50px rgba(99,102,241,0.06)',
               }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Pencil</div>
                <div className="text-sm text-gray-600">Eraser killer — Flowchart generator & editor</div>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
              Fast diagrams, beautiful UI.
            </h2>

            <p className="text-gray-600">
              Create diagrams from plain text, edit visually, sync with FlowLang, and export.
              Sign in to continue to the editor or create an account — fast and frictionless.
            </p>

            <ul className="text-sm text-gray-600 space-y-2 mt-4">
              <li>• AI-powered generation (GROQ Cloud)</li>
              <li>• Real-time code ↔ canvas sync</li>
              <li>• Export PNG / SVG / PDF</li>
            </ul>
          </div>

          {/* Right - Auth form (full, roomy card) */}
          <div className="rounded-3xl p-6"
               style={{
                 background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.85))',
                 backdropFilter: 'blur(6px)',
                 border: '1px solid rgba(0,0,0,0.04)',
                 boxShadow: '0 12px 30px rgba(2,6,23,0.06)',
               }}>
            <div className="max-w-xl mx-auto">
              {title && <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>}
              {children}
              <div className="mt-4 text-xs text-gray-500 text-center">By continuing you agree to our Terms & Privacy.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clerk provider wrapper to use react-router navigation
const ClerkWithRouter = ({ children }) => {
  const navigate = useNavigate();

  const clerkNavigate = (to) => {
    if (!to) return;
    try {
      const u = new URL(to, window.location.href);
      if (u.origin === window.location.origin) {
        navigate(u.pathname + u.search + u.hash);
        return;
      }
    } catch (e) {
      // not a full URL, fall back
    }
    try {
      navigate(to);
    } catch (e) {
      window.location.assign(to);
    }
  };

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      navigate={clerkNavigate}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      {children}
    </ClerkProvider>
  );
};

// Protected Route Component that redirects to sign-in if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

function RootRoutes() {
  return (
    <BrowserRouter>
      <ClerkWithRouter>
        <Routes>
          {/* Root route - protected, renders the App component */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />

          {/* Fullscreen SignIn */}
          <Route
            path="/sign-in/*"
            element={
              <AuthFullScreenLayout title="Welcome back">
                <SignIn
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'text-2xl font-bold text-gray-900',
                      headerSubtitle: 'text-gray-600',
                      formFieldInput: 'w-full px-4 py-3 rounded-lg border border-gray-200',
                      formButtonPrimary: 'w-full py-3 rounded-lg text-white font-semibold',
                      socialButtonsBlockButton: 'w-full py-3 rounded-lg border border-gray-100 bg-white text-sm font-medium',
                    },
                    variables: { colorPrimary: '#06b6d4' },
                  }}
                />
              </AuthFullScreenLayout>
            }
          />

          {/* Fullscreen SignUp */}
          <Route
            path="/sign-up/*"
            element={
              <AuthFullScreenLayout title="Create your account">
                <SignUp
                  routing="path"
                  path="/sign-up"
                  signInUrl="/sign-in"
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'text-2xl font-bold text-gray-900',
                      headerSubtitle: 'text-gray-600',
                      formFieldInput: 'w-full px-4 py-3 rounded-lg border border-gray-200',
                      formButtonPrimary: 'w-full py-3 rounded-lg text-white font-semibold',
                      socialButtonsBlockButton: 'w-full py-3 rounded-lg border border-gray-100 bg-white text-sm font-medium',
                    },
                    variables: { colorPrimary: '#06b6d4' },
                  }}
                />
              </AuthFullScreenLayout>
            }
          />

          {/* Redirect /app to root for backward compatibility */}
          <Route path="/app" element={<Navigate to="/" replace />} />

          {/* Catch all other routes and redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClerkWithRouter>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootRoutes />
  </React.StrictMode>
);