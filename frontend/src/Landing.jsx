// src/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegLightbulb } from 'react-icons/fa';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="bg-gradient-to-br from-gray-950 to-gray-800 absolute inset-0 opacity-80" />
      </div>

      <header className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500">
            Pencil
          </span>
          <FaRegLightbulb className="text-teal-400 text-xl" />
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter max-w-4xl mx-auto mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-400 to-pink-500">
          Visualize Your Ideas, Instantly.
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
          Generate professional flowcharts and diagrams from plain text using AI.
          No friction, just flow.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="relative px-8 py-4 text-lg font-bold text-white rounded-full overflow-hidden transition-transform transform hover:scale-105 duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl"
        >
          Get Started
        </button>
      </main>

      <footer className="relative z-10 text-center p-6 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Pencil. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
