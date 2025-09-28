// src/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

/**
 * Clean, single-CTA landing. Strong hero, single Get Started button that
 * routes to /app when signed in, otherwise to /sign-in.
 *
 * No external icon packages used (inline SVGs only).
 */

const LogoMark = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0" x2="1">
        <stop offset="0" stopColor="#06b6d4" />
        <stop offset="1" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <rect x="2" y="6" width="16" height="12" rx="3" fill="url(#lg1)" />
    <path d="M19 7l3 3-3 3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Landing = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (!isLoaded) return;
    if (isSignedIn) navigate('/app');
    else navigate('/sign-in');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-teal-50 overflow-hidden">
      {/* subtle background aura */}
      <div aria-hidden className="fixed inset-0 -z-10">
        <div style={{ position: 'absolute', inset: '-15%', filter: 'blur(120px)', opacity: 0.12, background: 'radial-gradient(circle at 20% 10%, #7c3aed, transparent 18%)' }} />
        <div style={{ position: 'absolute', inset: '-15%', filter: 'blur(100px)', opacity: 0.10, background: 'radial-gradient(circle at 85% 90%, #06b6d4, transparent 20%)' }} />
      </div>

      <header className="w-full max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
            <LogoMark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">Pencil</div>
            <div className="text-xs text-gray-500">Eraser killer — Flowchart generator & editor</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* hero column */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 text-sm text-gray-600">
              <div className="rounded-md px-3 py-1 text-xs font-semibold" style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.12), rgba(124,58,237,0.12))' }}>
                New — AI FlowGen
              </div>
              <div className="text-xs">Auto layout · FlowLang sync · Exports</div>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
              Visualize ideas. <span style={{ background: 'linear-gradient(90deg,#06b6d4,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ship diagrams faster</span>.
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl">
              Turn plain language into production-ready diagrams, refine with a clean editor, and export in multiple formats.
              Pencil is minimal, keyboard-first, and built for teams who move fast.
            </p>

            <div>
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 rounded-full text-white font-semibold shadow-2xl transform hover:-translate-y-0.5 transition"
                style={{ background: 'linear-gradient(90deg,#06b6d4,#7c3aed)' }}
              >
                Get Started — Eraser Killer
              </button>
            </div>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <li>• AI-Powered Diagram Generation</li>
              <li>• Real-time Code Editor (FlowLang)</li>
              <li>• Export PNG, SVG, PDF</li>
              <li>• Smooth ReactFlow canvas + keyboard shortcuts</li>
            </ul>
          </div>

          {/* visual mock column */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-md border border-gray-100 p-6 shadow-2xl">
              <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-emerald-50 p-6 flex items-center justify-center" style={{ height: 320 }}>
                <div style={{ width: 220, height: 120 }} className="rounded-lg bg-violet-500 shadow-lg" />
              </div>
              <div className="mt-5 text-center">
                <div className="font-semibold text-gray-800">Instant diagrams — refine visually</div>
                <div className="text-xs text-gray-500 mt-1">Auto layout • Export • FlowLang sync</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Pencil — Eraser Killer
      </footer>
    </div>
  );
};

export default Landing;
