// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react';
import App from './App';
import './index.css';

// Use the publishable key you provided (you already have it in your snippet)
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  console.error('Missing Clerk publishable key. Please check your environment variables.');
}

/*
  ClerkWithRouter: use react-router's useNavigate inside BrowserRouter
  so that Clerk's internal redirects use SPA navigation instead of page reloads.
  This prevents redirect races that can break auth flows and cause errors.
*/
const ClerkWithRouter = ({ children }) => {
  const navigate = useNavigate();

  const clerkNavigate = (to) => {
    if (!to) return;
    // If 'to' is a full URL on the same origin, convert to pathname+search+hash
    try {
      const u = new URL(to, window.location.href);
      if (u.origin === window.location.origin) {
        navigate(u.pathname + u.search + u.hash);
        return;
      }
    } catch (e) {
      // not a full URL, fall through
    }
    // fallback: try using react-router navigate (works for relative paths)
    try {
      navigate(to);
    } catch (e) {
      // final fallback: full browser navigation
      window.location.assign(to);
    }
  };

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} navigate={clerkNavigate}>
      {children}
    </ClerkProvider>
  );
};

function RootRoutes() {
  return (
    <BrowserRouter>
      <ClerkWithRouter>
        <Routes>
          {/* Clerk sign-in / sign-up endpoints (routing="path" tells Clerk to use SPA routing) */}
          <Route
            path="/sign-in/*"
            element={<SignIn routing="path" path="/sign-in" />}
          />
          <Route
            path="/sign-up/*"
            element={<SignUp routing="path" path="/sign-up" />}
          />

          {/* Your app root */}
          <Route path="/" element={<App />} />

          {/* fallback -> root */}
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
