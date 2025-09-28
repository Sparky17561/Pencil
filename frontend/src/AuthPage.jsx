// src/components/AuthPage.jsx
import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';

/**
 * Full-height AuthPage (component version).
 * Use this when you render the auth page as a component.
 * It forces Clerk's internal card to expand to fill the panel.
 */

const LogoSVG = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="lg2" x1="0" x2="1">
        <stop offset="0" stopColor="#06b6d4" />
        <stop offset="1" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <rect x="2" y="6" width="16" height="12" rx="3" fill="url(#lg2)" />
    <path d="M19 7l3 3-3 3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AuthPage = () => {
  const location = useLocation();
  const isSignUp = location.pathname.includes('/sign-up');

  // appearance object to force full coverage of Clerk UI
  const clerkAppearance = {
    elements: {
      rootBox: 'w-full h-full flex items-center justify-center',
      card: 'w-full h-full bg-transparent shadow-none max-w-none p-0',
      formFieldInput: 'w-full px-4 py-3 rounded-lg border border-gray-200',
      formButtonPrimary: 'w-full py-3 rounded-lg font-semibold',
      socialButtonsBlockButton: 'w-full py-3 rounded-lg border border-gray-100 bg-white',
      headerTitle: 'text-2xl font-bold text-gray-900',
      headerSubtitle: 'text-sm text-gray-600',
    },
    layout: { socialButtonsPlacement: 'top' },
    variables: { colorPrimary: '#06b6d4' },
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-stretch">
      {/* Left hero on large screens */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.7))',
          borderRadius: 18,
        }}
      >
        <div className="max-w-lg space-y-8">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl w-14 h-14 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
              <LogoSVG className="w-8 h-8" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Pencil</div>
              <div className="text-xs text-gray-600">Eraser killer — Flowchart generator</div>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold text-gray-900">Fast diagrams, beautiful UI</h2>
          <p className="text-gray-600">Turn plain language into production-ready diagrams, refine visually with a clean editor, and export to multiple formats.</p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" /></svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">AI-Powered Generation</div>
                <div className="text-sm text-gray-600">Generate FlowLang from plain text.</div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9" /></svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Real-time Code Editor</div>
                <div className="text-sm text-gray-600">Edit FlowLang and see live canvas updates.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: auth area that fills its column */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div
          className="w-full h-full rounded-2xl"
          style={{
            minHeight: 'calc(100vh - 48px)',
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.96))',
            boxShadow: '0 20px 60px rgba(2,6,23,0.06)',
            border: '1px solid rgba(15,23,42,0.04)',
          }}
        >
          <div style={{ width: '100%', height: '100%' }} className="flex items-center justify-center">
            {isSignUp ? (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/app"
                appearance={clerkAppearance}
              />
            ) : (
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/app"
                appearance={clerkAppearance}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
